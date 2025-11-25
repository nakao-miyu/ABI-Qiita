import OpenAI from "openai";
import { pipeline } from "@xenova/transformers";
import fs from "fs";
import readline from "readline";

// 文章を数列にする準備
async function main() {
    const embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

    // LLMを使う準備
    const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: "https://api.openai.com/v1",
    });

    // 検索したい文章を読み込む
    const docs = [
        fs.readFileSync("doc1.txt", "utf-8"),
    ];

    // 文章をベクトルに変換する
    const docEmbeddings = await Promise.all(
        docs.map(async (d) => {
        const output = await embedder(d);

        return Array.from(output.data[0]);
        })
    );

    // ユーザーからの質問をベクトル化する
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
});

    const query = await new Promise((resolve) => {
        rl.question("質問を入力してください: ", (answer) => {
            rl.close();
            resolve(answer);
        });
    });

    const queryEmb = await embedder(query);
    const qvec = Array.from(queryEmb.data[0]);

    // もっとも近い文書を見つける
    // 似ている度を計算する関数（コサイン類似度）
    // bestDocに最も似ている文章を入れる

    function cosineSimilarity(a, b) {
    const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
    const na = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
    const nb = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
    return dot / (na * nb);
    }

    let bestDoc = docs[0];
    let bestScore = -1;

    docEmbeddings.forEach((vec, i) => {
    const score = cosineSimilarity(vec, qvec);
        if (score > bestScore) {
        bestScore = score;
        bestDoc = docs[i];
        }
    });

    // LLMに質問する
    const response = await client.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
        { role: "system", content: `参考文書: ${bestDoc}` },
        { role: "user", content: query },
        ],
    });

    // 回答を出力する
    console.log("回答:");
    console.log(response.choices[0].message.content);
}

main();
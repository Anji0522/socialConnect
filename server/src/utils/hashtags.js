export function extractHashtags(content = "") {
  const matches = content.match(/#([A-Za-z0-9_]+)/g) || [];
  return [...new Set(matches.map((tag) => tag.slice(1).toLowerCase()))];
}

export async function bumpHashtags(Hashtag, tags) {
  await Promise.all(
    tags.map((tag) =>
      Hashtag.findOneAndUpdate({ tag }, { $inc: { postCount: 1 }, $setOnInsert: { tag } }, { upsert: true }),
    ),
  );
}

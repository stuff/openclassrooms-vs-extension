export async function forEachTranslateCall(text: string, callback: any) {
  let match;

  const translationCallRegEx = [
    /(translate\()('(\w+\.\w+.*?)')(\))/g,
    /(<Translate.*?content=)("(\w+\.\w+.*?))(")/gms,
  ];

  for (const reg of translationCallRegEx) {
    while ((match = reg.exec(text))) {
      const key: string = match[3];
      await callback(key, match);
    }
  }
}

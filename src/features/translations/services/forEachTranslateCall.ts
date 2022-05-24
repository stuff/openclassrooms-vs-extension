export async function forEachTranslateCall(text: string, callback: any) {
  let match;

  // FIXME: Handle {translate('admin.crud.cta.add', { item: labelItemSingular })}
  const translationCallRegEx = [
    /(translate\()('(\w+\.\w+.*?)')(\))/g,
    /(translate\()('(\w+\.\w+.*?)').*?}\)}/gms,
    /(<Translate.*?content=)("(\w+\.\w+.*?)")/gms,
  ];

  for (const reg of translationCallRegEx) {
    while ((match = reg.exec(text))) {
      const key: string = match[3];
      await callback(key, match);
    }
  }
}

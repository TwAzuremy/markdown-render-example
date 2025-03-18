export function spacesSeparatedToHump(spacesSeparatedName) {
    return spacesSeparatedName
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (match, index) => index === 0 ? match : match.toUpperCase())
        .replace(/\s+/g, '');
}
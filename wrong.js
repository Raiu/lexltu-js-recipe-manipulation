// fix wrong page

async function getHtmlDom(url) {
    const response = await fetch(url);
    const text = await response.text();
    const parser = new DOMParser();
    return parser.parseFromString(text, "text/html");
}

async function fixIt() {
    const indexDom = await getHtmlDom("index.html");
    compareDom(indexDom.documentElement, document.documentElement);
    return indexDom;
}

function compareDom(n1, n2) {
    console.log(n1);
    console.log(n2);
}

document.body.style.display = 'none';
fixIt().then(test => {
    document.body.style.display = 'block';
    console.log(test)
});
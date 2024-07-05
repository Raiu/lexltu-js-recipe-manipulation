/**
 * @param {string} url              - The URL of the webpage to fetch.
 * @returns {Promise<Document>}     - A promise that resolves to the parsed HTML document.
 */
const fetchDom = async (url) => {
    const response = await fetch(url);
    const text = await response.text();
    const parser = new DOMParser();
    return parser.parseFromString(text, "text/html");
};

/**
 * @param {string} url                  - The URL of the CSS file to fetch.
 * @returns {Promise<CSSStyleSheet>}    - A promise that resolves to the CSSStyleSheet object.
 */
const fetchCss = async (url) => {
    const response = await fetch(url);
    const text = await response.text();
    const sheet = new CSSStyleSheet();
    await sheet.replace(text);
    return sheet;
};

const fixIt = async (domUrl) => {
    const oDoc = await fetchDom(domUrl);

    if (!oDoc) {
        console.log("Error: Could not load document.");
        return;
    }

    const cssUrl = Array.from(oDoc.getElementsByTagName("link"))
        .filter(
            (link) => link.rel == "stylesheet" && link.href.includes("index")
        )
        .map((link) => link.href)[0];

    const oCss = await fetchCss(cssUrl);

    if (!oCss) {
        console.log("Error: Could not load css.");
        return;
    }

    const docCss = Array.from(document.styleSheets).find((s) =>
        s.href.includes("wrong")
    );

    //////////////////////////////////////////////////////////////////////////

    // 1.  fix logo
    const logoSelector = "header .logo-text";
    const oDocLogo = oDoc.querySelector(logoSelector);
    const docLogo = document.querySelector(logoSelector);
    const logoProperties = getProperties(docLogo, docCss);
    const oDoclogoProperties = getProperties(oDocLogo, oCss);
    for (const [key, val] of Object.entries(logoProperties)) {
        //console.log(key + ": " + val);
        if (oDoclogoProperties[key] !== val) {
            let newValue = getCssValue(oDocLogo, key, oCss.cssRules);
            if (newValue) {
                docLogo.style[key] = newValue;
            }
        }
    }

    // 2.  fix header flex
    document.querySelector("body header").style.justifyContent = "inherit";

    // 3.  fix header border
    document.querySelector("body header").style["border-bottom"] = getCssValue(
        oDoc.querySelector("body header"),
        "border-bottom",
        oCss.cssRules
    );

    // 4.  fix recipe name
    const docRecipeName = oDoc.querySelector("#recipe-name").innerHTML;
    document.querySelector("#recipe-name").innerHTML = docRecipeName;

    // 5. 6.  fix timer
    const oDocTimer = oDoc.querySelector(".time-container");
    const docTimer = document.querySelector(".time-container");
    for (const child of docTimer.children) {
        // 5. fix timer icon
        if (!containsNumber(child.innerHTML)) {
            for (const oChild of oDocTimer.children) {
                if (!containsNumber(oChild.innerHTML)) {
                    child.classList.add(oChild.classList[0]);
                }
            }
        }
        // 6. fix timer text
        else {
            for (const oChild of oDocTimer.children) {
                if (containsNumber(oChild.innerHTML)) {
                    child.innerHTML = oChild.innerHTML;
                }
            }
        }
    }

    // 7. fix img url
    const correctImgUrl = oDoc.querySelector(".image-container img").src;
    if (correctImgUrl) {
        document.querySelector(".image-container img").src = correctImgUrl;
    }

    // 8. fix ingredients
    document.querySelector(
        ".ingredients-container h3.ingredients"
    ).textContent = "Ingredienser";

    document.querySelector(".ingredients-container").style["background-color"] =
        getCssValue(
            oDoc.querySelector(".ingredients-container"),
            "background-color",
            oCss.cssRules
        );

    // 9. fix ingredients bottom
    const selectorBottom = ".ingredients-container ul.ingredients-list-bottom";
    document.querySelector(selectorBottom).innerHTML =
        oDoc.querySelector(selectorBottom).innerHTML;

    // 10. 11. fix ingredients paste
    const selectorPaste = ".ingredients-container ul.ingredients-list-paste";
    const docPaste = document.querySelector(selectorPaste);
    const oDocPaste = oDoc.querySelector(selectorPaste);
    for (let i = 0; i < oDocPaste.children.length; i++) {
        let oChild = oDocPaste.children[i];
        let child = docPaste.children[i];
        if (!child) {
            docPaste.appendChild(oChild);
        }
        else if (oChild.innerHTML != child.innerHTML) {
            child.innerHTML = oChild.innerHTML;
        }
    }

    // 12. fix instructions shadows
    document.querySelector("h3.instructions.shadow").classList.remove("shadow");

    // 13. fix instructions
    const selectorInstructions = ".instructions-container ol.instructions-list";
    const instructionsList = document.querySelector(selectorInstructions);
    const oDocInstructions = oDoc.querySelector(selectorInstructions);
    if (instructionsList) {
        if (
            instructionsList.children.length == oDocInstructions.children.length
        ) {
            for (let i = 0; i < instructionsList.children.length; i++) {
                let child = instructionsList.children[i];
                let oChild = oDocInstructions.children[i];
                if (child.innerHTML != oChild.innerHTML) {
                    /* console.log(
                        `Fixing:\n ${child.innerHTML} \nWith:\n ${oChild.innerHTML}`
                    ); */
                    child.innerHTML = oChild.innerHTML;
                }
            }
        } else {
            console.log("Error: not matching number of list items");
        }
    }
};

/**
 * @param {Element} element - The DOM element.
 * @param {string} property - The CSS property to retrieve.
 * @param {CSSRuleList} css - The list of CSS rules.
 * @returns {string|null}   - The value of the CSS property, or null if not found.
 */
const getCssValue = (element, property, css) => {
    if (!element || !property || !css) {
        return null;
    }

    for (let i = css.length - 1; i >= 0; i--) {
        const rule = css[i];
        const selector = rule.selectorText;

        if (element.matches(selector)) {
            if (selector === "*" && element.parentNode.nodeType !== 9) {
                break;
            }

            if (rule.style[property]) {
                return rule.style.getPropertyValue(property);
            }
        }
    }

    return element.parentNode
        ? getCssValue(element.parentNode, property, css)
        : null;
};

/**
 * @param {Element} element
 * @param {StyleSheet} css
 * @returns
 */
const getProperties = (element, css) => {
    if (!element || !css) {
        return null;
    }

    const rule = Array.from(css.cssRules)
        .reverse()
        .find((rule) => element.matches(rule.selectorText));

    if (!rule) {
        return null;
    }

    return Array.from(rule.style).reduce(
        (o, key) => ({ ...o, [key]: rule.style.getPropertyValue(key) }),
        {}
    );
};

/**
 *
 * @param {string} str
 * @returns {boolean}
 */
const containsNumber = (str) => /\d/.test(str);

document.addEventListener("DOMContentLoaded", () => {
    document.body.style.display = "none";

    fixIt("index.html").then(() => {
        document.body.style.display = "block";

        console.log("done");
    });
});

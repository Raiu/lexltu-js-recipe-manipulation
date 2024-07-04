const recipeNameTag = document.querySelector("#recipe-name");
if (recipeNameTag) {
    console.log(recipeNameTag.textContent);
    console.log(recipeNameTag.tagName);
}

const paraDiscription = document.querySelector("p.description");
if (paraDiscription) {
    console.log(window.getComputedStyle(paraDiscription).fontSize);
}

const images = document.querySelectorAll('img');
images.forEach(img => {
    console.log(img.alt);
    let imgData = {
        url: img.src,
        height: img.height,
        width: img.width,
    };
    console.log(imgData);
});

const pasteList = document.querySelector("ul.ingredients-list-paste");
if (pasteList) {
    console.log(pasteList.children.length);

    if (pasteList.children.length >= 4) {
        let fourthElement = pasteList.children[3];
        console.log(fourthElement);
    }
}

const instructionsList = document.querySelectorAll("ol.instructions-list li");
const instructions = [];
if (instructionsList) {
    instructionsList.forEach(item => {
        instructions.push({
            order: getChildIndex(item),
            text: item.textContent,
        });
    });
}
console.log(instructions);


function getChildIndex(node) {
    return Array.prototype.indexOf.call(node.parentNode.children, node);
}
const operators = ['*', "-", "+", "/"]

function convertBetweenRadAndDeg(value, degreeAngle) {
    if (degreeAngle) {
        return (parseFloat(value) * Math.PI) / 180.0
    }
    return value
}

function isOperator(character) {
    return operators.includes(character)
}

function isOperatorAllowed(character, lastCharacterAdded, equalIsClicked, displayedText) {
    return displayedText.length > 0 && (isNumber(lastCharacterAdded) || isClosingBracket(lastCharacterAdded))
        || isOpenBracket(lastCharacterAdded) && character === '-'
        || equalIsClicked && isOperator(character)
}

function isOperationAllowed(lastCharacterAdded) {
    return !isOperator(lastCharacterAdded) && !equalIsClicked
}

function isPoint(character) {
    return character === '.'
}

function isPointAllowed(displayedTextLength, lastCharacterAdded) {
    return displayedTextLength > 0 && isNumber(lastCharacterAdded)
}

function isClosingBracket(character) {
    return character === ')'
}

function isOpenBracket(character) {
    return character === '('
}

function checkIfBracketAllowed(bracket, lastCharacterAdded, openBracket, displayedText) {
    if (bracket === '(')
        return operators.includes(lastCharacterAdded) || lastCharacterAdded === '(' || displayedText === '0'
    else if (bracket === ')')
        return (isNumber(lastCharacterAdded) && openBracket)
            || (openBracket && lastCharacterAdded !== '(' && (isNumber(lastCharacterAdded)
                || lastCharacterAdded === ')'))
    return false
}

function isNumber(value) {
    return !isNaN(value)
}

function checkIfLastIsOperator(value) {
    const lastChar = value.slice(-1);
    return operators.includes(lastChar)
}

function findLastCharacter(value) {
    //check if the last element is operator or bracket (it is surrounded by span tag)
    if (value.endsWith('</span>')) {
        value = removeSpanTags(value, true);
        return value.slice(-1);
    } else return value.slice(-1); //in this case it's number or '.'

}

// input value to display based on sign - if negative, add brackets
function appendValue(result) {
    if (!Number.isInteger(result)) addedPointToNumber = 1
    if (result >= 0) inputCharacter(result.toString())

    else if (result < 0) {
        inputCharacter('(')
        inputCharacter(result.toString())
        inputCharacter(')')
    }
}

function getAllNumbersAdded(displayedText) {
    //removing operators from displayed text
    return removeSpanTags(displayedText).split(/[-+*/=()]/);
}

function getLastNumberAdded(displayedText) {
    let numbersArray = []
    if (displayedText !== '0' || displayedText !== 0)
        numbersArray = getAllNumbersAdded(displayedText);
    else
        // perform action on result, if equal is clicked
        numbersArray = getAllNumbersAdded(resultDisplay.innerHTML);
    return numbersArray[numbersArray.length - 1]
}

function isNumberAllowed(lastCharacterAdded) {
    return !isClosingBracket(lastCharacterAdded)
}

function removeSpanTags(inputString, removeLastOnly = false) {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = inputString;

    //select all spans with operators and put them into an array
    const operatorsSpan = Array.from(tempElement.getElementsByTagName('span'));

    //remove only last
    if (removeLastOnly) {
        const lastSpan = operatorsSpan[operatorsSpan.length - 1]
        const spanContent = lastSpan.innerHTML
        lastSpan.parentNode.replaceChild(document.createTextNode(spanContent), lastSpan)
    } else {
        operatorsSpan.forEach((operatorSpan) => {
            const operator = operatorSpan.innerHTML
            operatorSpan.parentNode.replaceChild(document.createTextNode(operator), operatorSpan);
        })
    }

    return tempElement.innerHTML;
}

function showAlert(message) {
    let alertItem = document.querySelector('.alert')
    alertItem?.classList.toggle('hidden', false);
    alertItem.querySelector('.alert-text').innerHTML = message
    setTimeout(() => {
        // Add the 'hidden' class back to hide the alert
        document.querySelector('.alert')?.classList.toggle('hidden', true);
    }, 1500);
    //   equalIsClicked = false
}

function showInvalidInputAlert() {
    let equalSymbol = document.querySelector('.equal')
    equalSymbol.style.color = '#EF5350'
    setTimeout(() => {
        equalSymbol.style.color = '';
    }, 500);

    showAlert('Please check last entered character!');
}

function toggleDarkMode(isDarkMode) {
    document.querySelector('body')?.classList.toggle('darkActive', isDarkMode);
    document.querySelector('.darkMode')?.classList.toggle('light', !isDarkMode);
    document.querySelector('.darkMode')?.classList.toggle('dark', isDarkMode);
    document.querySelector('img.light')?.classList.toggle('hidden', isDarkMode);
    document.querySelector('img.dark')?.classList.toggle('hidden', !isDarkMode);
    document.querySelector('img.backspaceLight')?.classList.toggle('hidden', isDarkMode);
    document.querySelector('img.backspaceDark')?.classList.toggle('hidden', !isDarkMode);
}


function getDarkModePreferences() {
    let darkModeSavedPreferences = true
    if (JSON.parse(window.localStorage.getItem('darkMode')))
        darkModeSavedPreferences = JSON.parse(window.localStorage.getItem('darkMode'));
    if (!darkModeSavedPreferences) {
        let systemPreferences = false;
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) systemPreferences = true;
        window.localStorage.setItem('darkMode', JSON.stringify({value: systemPreferences}));
        return systemPreferences;
    } else {
        if (darkModeSavedPreferences.value) return true;
    }
    return false;
}

function switchSavedModePreference() {
    const darkModeSavedPreferences = JSON.parse(window.localStorage.getItem('darkMode') ?? 'true');
    window.localStorage.setItem('darkMode', JSON.stringify({value: !darkModeSavedPreferences.value}));
}

function addEffectToDisplay(resultDisplay) {
    resultDisplay.classList.add('fade-text')
    setTimeout(() => {
        resultDisplay.classList.remove('fade-text');
    }, 30);
}

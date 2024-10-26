const resultDisplay = document.querySelector('#value');
let displayedText = '0';
let addedPointToNumber = 0
let equalIsClicked = false
let displayedTextBeforeEqual = ''
let lastCharacterAdded = ''
let degreeAngle = false
let openBracket = 0

//checking mode preference
window.addEventListener("load", () => toggleDarkMode(getDarkModePreferences()));
//adding event listeners to keyboard buttons
window.addEventListener("keydown", async (event) => {
    const key = event.key;
    if (key >= '0' && key <= '9') {
        inputCharacter(key)
    } else if (key === '.' || key === ',' || key === 'Decimal') {
        inputCharacter('.')
    } else if (isOperator(key)) {
        inputCharacter(key)
    } else if (key === 'Backspace' || key === 'Delete') {
        eraseLastCharacter()
    } else if (key === 'Enter' || key === 'Return') {
        calcResult();
    } else if (key === 'Escape') {
        eraseAll()
    }  /*else if ((event.ctrlKey || event.metaKey) && key === 'v') {
        const clipboardData = await navigator.clipboard.readText();
        console.log(await navigator.clipboard.readText())
        if (clipboardData) {
            const pastedText = clipboardData.toString();
            if (/^\d+$/.test(pastedText)) {
                displayedText += pastedText.replace(',', '.');
                updateDisplay();
            }
        }
    }*/
});

function inputCharacter(character, isNegative = false) {
    //check if the added character is a number
    if (isNumber(character) && isNumberAllowed(lastCharacterAdded)) {
        if (displayedText === '0' && character === '0') return;
        if (displayedText === '0') {
            displayedText = ''
        }
        if (displayedText !== '0' && equalIsClicked) {
            displayedText = ''
            resultDisplay.innerHTML = '0'
            equalIsClicked = false
        }
        if (isNegative) {
            // surround negative numbers with brackets
            displayedText += '(' + parseFloat(character) + ')'
            updateDisplay()
            return;
        }
        //handling the case of leading zeros before a number ex. 023 -> 23
        if (lastCharacterAdded === '0' && isNumber(character) && !isNumber(displayedText[displayedText.length - 2])) {
            eraseZero()
        }

        //using parseFloat as we will use this function to also add sin(x), tan(x) etc which might be floats.
        displayedText += parseFloat(character);
        lastCharacterAdded = character

        //checking if the added character is operator and if operator is allowed
    } else if (isOperator(character) && isOperatorAllowed(character, lastCharacterAdded, equalIsClicked, displayedText)) {
        if (character === '-' && displayedText === '0') displayedText = '';
        displayedText += `<span class='sign'>${character}</span>`;
        addedPointToNumber = 0
        lastCharacterAdded = character;

        //checking if the added character is point and if point is allowed
    } else if (isPoint(character) && isPointAllowed(displayedText.length, lastCharacterAdded)) {
        //handle cases when multiple . are added to the floating point number - so for example 9.9.8 is not allowed
        if (addedPointToNumber === 1) return
        displayedText += '.';
        addedPointToNumber = 1
        lastCharacterAdded = character;

        // checking if the added character is brackets and if they are allowed
    } else if (character === '(' || character === ')' && displayedText !== '0') {
        if (displayedText === '0') displayedText = ''
        displayedText += `<span class='sign'>${character}</span>`;
        lastCharacterAdded = character;
    }
    updateDisplay();
}

// used to update display
function updateDisplay() {
    if (equalIsClicked) equalIsClicked = false
    document.querySelector('.operation').innerHTML = displayedText.length !== 0 ? displayedText : '0';
}

// used to calculate result, if the expression is correct
function calcResult() {
    if (openBracket !== 0) {
        showAlert('Please check brackets!')
        return;
    }
    let res = removeSpanTags(displayedText);
    if (res === '') res = 0 //handling the case when user didn't input anything

    //if the user entered an operator but not a number after, then don't perform calculations
    if (checkIfLastIsOperator(res)) {
        showInvalidInputAlert()
        return
    }
    try {
        res = eval(res);
    } catch (e) {
        //handling other cases
        showAlert('Invalid characters added!')
        return;
    }
    if (res === undefined) res = 'error';

    equalIsClicked = true;
    displayedTextBeforeEqual = displayedText
    displayedText = parseFloat(res.toFixed(10)).toString();
    resultDisplay.innerHTML = parseFloat(res.toFixed(10)).toString();

    //adding the fade effect to display
    addEffectToDisplay(resultDisplay)
}

function eraseAll() {
    displayedText = '0'
    resultDisplay.innerHTML = '0';
    addedPointToNumber = 0
    openBracket = 0
    lastCharacterAdded = ''
    updateDisplay()
}

function eraseLastCharacter() {
    // if equal is clicked, focus goes back to the added expression
    if (equalIsClicked) {
        resultDisplay.innerHTML = '0';
        displayedText = displayedTextBeforeEqual
        updateDisplay()
        return

    } else if (displayedText !== '' && displayedText !== 0 && displayedText !== '0') {
        // checking different cases of last character: point, bracket, operator
        if (displayedText.endsWith('</span>'))
            displayedText = removeSpanTags(displayedText, true);
        if (displayedText.endsWith('.')) addedPointToNumber = false
        if (displayedText.endsWith(')')) openBracket++
        if (displayedText.endsWith('(')) openBracket--

        displayedText = displayedText.slice(0, displayedText.length - 1);
        lastCharacterAdded = findLastCharacter(displayedText);
    } else displayedText = '0'

    updateDisplay()

}

// helper function to erase leading zeros 023 -> 23
function eraseZero() {
    let displayedValue = removeSpanTags(displayedText);
    if (displayedValue.endsWith('0')) {
        let elementsBeforeZero = displayedValue.slice(0, -1);
        //checking if the leading zero should be erased
        if (elementsBeforeZero.endsWith('.')
            || elementsBeforeZero.endsWith(')')
            || elementsBeforeZero.endsWith('(')
            || !isOperator(elementsBeforeZero.slice(-1))) return

        displayedText = displayedText.slice(0, -1)
    }
}

function changeTheme() {
    switchSavedModePreference();
    toggleDarkMode(getDarkModePreferences())
}

function calculatePercentage() {
    updateLastNumber(num => num / 100);
}

function calculateSquarePower() {
    updateLastNumber(num => num * num);
}

// used to calculate percentage and power of number
function updateLastNumber(operation) {
    let lastNumber
    //if equal is clicked, perform the operation on the result
    if (equalIsClicked) lastNumber = displayedText
    // else, operation is performed on the last value added
    else lastNumber = getLastNumberAdded(displayedText);
    if (lastNumber) {
        const result = operation(lastNumber);
        displayedText = displayedText.replace(new RegExp(lastNumber + '$'), '')
        appendValue(parseFloat(result.toFixed(10)).toString());
    }
}

function calculateTrigExpression(expression) {
    // trig calculations not allowed after clicking equal.
    if (getLastNumberAdded(displayedText) && isOperationAllowed(lastCharacterAdded)) {
        let lastNumber = getLastNumberAdded(displayedText);
        let result = Math[expression](parseFloat(convertBetweenRadAndDeg(lastNumber, degreeAngle))).toFixed(10)
        displayedText = displayedText.replace(new RegExp(lastNumber + '$'), '')
        appendValue(result)
    } else showAlert('This operation is not allowed!')
}

function calculateInDegree() {
    degreeAngle = !degreeAngle
    // Get the spans by their IDs
    const radSpan = document.getElementById('rad');
    const degSpan = document.getElementById('deg');

    // Change opacity based on the unit (fading effect)

    if (degreeAngle) {
        radSpan.style.opacity = '0.3';// Fade RAD
        degSpan.style.opacity = '1';
        degSpan.style.fontWeight = '600'
    } else {
        radSpan.style.opacity = '1';   // Fully visible RAD
        degSpan.style.opacity = '0.3'; // Fade DEG
        radSpan.style.fontWeight = '600'
    }
}

// used to perform calculations of square root and log10 (operations that doesn't exist on negative values).
function advancedOperations(operation, text) {
    let lastNumber
    if (equalIsClicked) lastNumber = displayedText
    else lastNumber = getLastNumberAdded(displayedText);
    if (lastNumber) {
        if (lastNumber < 0) {
            showAlert(text + " of negative numbers doesn't exist!")
            return
        } else if (lastNumber === '0' && operation === 'log10') {
            showAlert(text + " of zero leads to infinity!")
            return
        }
        let result = Math[operation](parseFloat(lastNumber)).toFixed(10)
        displayedText = displayedText.replace(new RegExp(lastNumber + '$'), '')
        appendValue(parseFloat(result).toFixed(10).toString())
    }
}

function addBracket(bracket) {
    if (bracket === '(' && checkIfBracketAllowed(bracket, lastCharacterAdded, openBracket, displayedText)) {
        openBracket++
        inputCharacter('(')
    } else if (bracket === ')' && checkIfBracketAllowed(bracket, lastCharacterAdded, openBracket, displayedText)) {
        openBracket--
        inputCharacter(')')
    }
}
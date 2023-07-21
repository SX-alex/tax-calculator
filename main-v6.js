
const setAttributeToLabel = (label, div) => {
	label.innerHTML = div.innerHTML;
  for (const attr of div.attributes) {
    label.setAttribute(attr.name, attr.value);
  }
}

const convertDivToLabel = (div) => {
	// Create a new label element
  const labelElement = document.createElement("label");

  // Copy the attributes and contents from the div to the label
  setAttributeToLabel( labelElement, div );

  // Replace the div element with the label element
  div.parentNode.replaceChild(labelElement, div);
}

function formatInputWithCommas(inputElement) {
  const input = inputElement.value;
  const cursorPosition = inputElement.selectionStart;
  const prevLength = input.length;

  // Remove any non-numeric characters
  const numericInput = input.replace(/[^0-9]/g, '');

  // Add comma every 3 digits
  const formattedInput = numericInput.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  const inputValue = numericInput === '0' ? '' : formattedInput;

  inputElement.value = inputValue;

  let newCursorPosition = cursorPosition + (inputValue.length - prevLength);

  if (cursorPosition === prevLength && cursorPosition === input.length) {
    newCursorPosition = inputValue.length;
  }

  inputElement.setSelectionRange(newCursorPosition, newCursorPosition);
}

// Function to remove text letter by letter
function removeText(element, text, index, callback) {
  if (index >= 0) {
    setTimeout(() => {
      element.textContent = text.slice(0, index);
      removeText(element, text, index - 1, callback);
    }, 60);
  } else {
    callback();
  }
}

// Function to add text letter by letter
function addText(element, text, index) {
  if (index <= text.length) {
    setTimeout(() => {
      element.textContent = text.slice(0, index);
      addText(element, text, index + 1);
    }, 60);
  }
}

// Function to replace text in all elements sequentially
function replaceTextAll(newText) {
  // Remove text from all elements
  const removePromises = Array.from(currencyElements, element => {
    return new Promise(resolve => {
      const currentText = element.textContent;
      removeText(element, currentText, currentText.length, resolve);
    });
  });

  // Add new text to all elements after removal
  Promise.all(removePromises).then(() => {
    for (let i = 0; i < currencyElements.length; i++) {
      const element = currencyElements[i];
      addText(element, newText, 0);
    }
  });
}

// calc heper functions

const clacIncomeTax = () => {

  
}


// Get the div element
const exercisePrice = document.getElementById("exercise-price-field__wrapper");
const valueOfShares = document.getElementById("value-of-shares-field__wrapper");
const sharesPrice = document.getElementById("shares-price-field__wrapper");
const annualIncome = document.getElementById("annual-income-field__wrapper");

convertDivToLabel( exercisePrice );
convertDivToLabel( valueOfShares );
convertDivToLabel( sharesPrice );
convertDivToLabel( annualIncome );

//get fields
const taxCountryField = document.getElementById('tax-country-field');
const exercisePriceField = document.getElementById('exercise-price-field');
const valueOfSharesField = document.getElementById('value-of-shares-field');
const sharesPriceField = document.getElementById('shares-price-field');
const annualIncomeField = document.getElementById("annual-income-field");
const currencyElements = document.getElementsByClassName('is--currency');

const treatmentToggle = document.getElementById('treatment-toggle');

//get outputs
const yourCostOut = document.getElementById('your-cost-out');
const totalTaxesOut = document.getElementById('total-taxes-out');
const yourGainOut = document.getElementById('your-gain-out');
const totalTaxesOutVsop = document.getElementById('total-taxes-out__vsop');
const yourGainOutVsop = document.getElementById('your-gain-out__vsop');

const yourCostBar = document.getElementById('your-cost-bar');
const totalTaxesBar = document.getElementById('total-taxes-bar');
const yourGainBar = document.getElementById('your-gain-bar');

const totalTaxesBarVsop = document.getElementById('total-taxes-bar__vsop');
const yourGainBarVsop = document.getElementById('your-gain-bar__vsop');

exercisePriceField.addEventListener('input', (event) => {
  formatInputWithCommas(event.target);
});

valueOfSharesField.addEventListener('input', (event) => {
  formatInputWithCommas(event.target);
});

sharesPriceField.addEventListener('input', (event) => {
  formatInputWithCommas(event.target);
});

annualIncomeField.addEventListener('input', (event) => {
  formatInputWithCommas(event.target);
});

// calc

const setCountryCur = (country) => {
	let value = "";
  
  switch (country) {
    case "Austria":
    case "Estonia":
    case "Cyprus":
    case "Germany":
    case "Latvia":
    case "Lithuania":
    case "Malta":
    case "Netherlands":
      value = "EUR";
      break;
    case "Czechia":
      value = "CZK";
      break;
    case "Denmark":
      value = "DKK";
      break;
    case "Poland":
      value = "PLN";
      break;
    case "Georgia":
      value = "GEL";
      break;
    case "Romania":
      value = "RON";
      break;
    case "Ukraine":
      value = "UAH";
      break;
    default:
      value = "EUR";
      break;
  }

  return value;
}

function removeCommas(value) {
  const withoutCommas = value.replace(/,/g, '');
  return Number(withoutCommas);
}

let taxCountryLoc = setCountryCur(taxCountryField.options[taxCountryField.selectedIndex].text);
let exercisePriceLoc = '10';
let valueOfSharesLoc = '500';
let sharesPriceLoc = '10000';
let annualIncomeLoc = '100000';

let selectetCountry = taxCountryField.value;

let benefitAmount = valueOfSharesLoc - exercisePriceLoc > 0 ? valueOfSharesLoc - exercisePriceLoc : 0;
let benefitAmountIncome = annualIncomeLoc + benefitAmount;

let vsopBenefitAmount = sharesPriceLoc;
let vsopBenefitAmountIncome = annualIncomeLoc + vsopBenefitAmount;

yourCostOut.textContent = exercisePriceLoc;
totalTaxesOut.textContent = valueOfSharesLoc;
yourGainOut.textContent = sharesPriceLoc - valueOfSharesLoc - exercisePriceLoc;
totalTaxesOutVsop.textContent = valueOfSharesLoc;
yourGainOutVsop.textContent = sharesPriceLoc - valueOfSharesLoc - exercisePriceLoc;

yourCostBar.style.height = Math.ceil( ( exercisePriceLoc / sharesPriceLoc ) * 100) + "%";
totalTaxesBar.style.height = Math.ceil( ( valueOfSharesLoc / sharesPriceLoc ) * 100) + "%";
yourGainBar.style.height = Math.ceil( ( ( sharesPriceLoc - valueOfSharesLoc - exercisePriceLoc ) / sharesPriceLoc ) * 100) + "%";
totalTaxesBarVsop.style.height = Math.ceil( ( valueOfSharesLoc / sharesPriceLoc ) * 100) + "%";
yourGainBarVsop.style.height = Math.ceil( ( ( sharesPriceLoc - valueOfSharesLoc - exercisePriceLoc ) / sharesPriceLoc ) * 100) + "%";

console.log('taxCountryLoc:', taxCountryLoc);

function updateData() {
	//set default values
  if ( taxCountryLoc !== setCountryCur(taxCountryField.options[taxCountryField.selectedIndex].text) ){
  	taxCountryLoc = setCountryCur(taxCountryField.options[taxCountryField.selectedIndex].text);
    replaceTextAll(taxCountryLoc);
  }
  
  exercisePriceLoc = exercisePriceField.value === '' ? '10' : removeCommas(exercisePriceField.value);
  valueOfSharesLoc = valueOfSharesField.value === '' ? '500' : removeCommas(valueOfSharesField.value);
  sharesPriceLoc = sharesPriceField.value === '' ? '10000' : removeCommas(sharesPriceField.value);
  annualIncomeLoc = annualIncomeField.value === '' ? '100000' : removeCommas(annualIncomeField.value);
  
  yourCostOut.textContent = exercisePriceLoc;
  totalTaxesOut.textContent = valueOfSharesLoc;
  yourGainOut.textContent = sharesPriceLoc - valueOfSharesLoc - exercisePriceLoc;
  totalTaxesOutVsop.textContent = valueOfSharesLoc;
  yourGainOutVsop.textContent = sharesPriceLoc - valueOfSharesLoc - exercisePriceLoc;

  yourCostBar.style.height = Math.ceil( ( exercisePriceLoc / sharesPriceLoc ) * 100) + "%";
  totalTaxesBar.style.height = Math.ceil( ( valueOfSharesLoc / sharesPriceLoc ) * 100) + "%";
  yourGainBar.style.height = Math.ceil( ( ( sharesPriceLoc - valueOfSharesLoc - exercisePriceLoc ) / sharesPriceLoc ) * 100) + "%";
  totalTaxesBarVsop.style.height = Math.ceil( ( valueOfSharesLoc / sharesPriceLoc ) * 100) + "%";
  yourGainBarVsop.style.height = Math.ceil( ( ( sharesPriceLoc - valueOfSharesLoc - exercisePriceLoc ) / sharesPriceLoc ) * 100) + "%";

  console.log(treatmentToggle.checked);
}

taxCountryField.onchange = () => {
    updateData();
};

taxCountryField.addEventListener('input', updateData);
exercisePriceField.addEventListener('input', updateData);
valueOfSharesField.addEventListener('input', updateData);
sharesPriceField.addEventListener('input', updateData);
annualIncomeField.addEventListener('input', updateData);

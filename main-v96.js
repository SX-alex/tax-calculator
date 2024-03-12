let loadingAllow = false;
let blockLoading = false;

const showTaxLoaderAndResults = () => {
    const resultsElement = document.getElementById('results');
    const taxLoaderElement = document.getElementById('tax-loader-group');

    if (loadingAllow && blockLoading){
        resultsElement.style.display = 'none';
        taxLoaderElement.style.display = 'flex';

        setTimeout(() => {
            resultsElement.style.display = 'flex';
            taxLoaderElement.style.display = 'none';
        }, 600);
    }
}


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

function formatInputWithCommasWithZero(inputElement) {
    const input = inputElement.value;
    const cursorPosition = inputElement.selectionStart;
    const prevLength = input.length;

    // Remove any non-numeric characters
    const numericInput = input.replace(/[^0-9]/g, '');

    // Remove extra leading zeros, allowing a single zero
    let cleanedInput = numericInput.replace(/^0+(?=\d)/, '');

    // Add comma every 3 digits
    const formattedInput = cleanedInput.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    const inputValue = formattedInput;

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

const calculatePersentValue = (value, persent) => {
    return value * persent / 100;
}

const calculateIncomeTaxProgres =(taxBrackets, pitRate, benefitAmountIncome, benefitAmount, minus) => {

    if (benefitAmountIncome <= taxBrackets[0]) {
        return ((benefitAmount - minus) * pitRate[0]) / 100;
    }

    for (let i = 1; i < taxBrackets.length; i++) {
        if (benefitAmountIncome <= taxBrackets[i]) {
            const taxAmount = ((benefitAmount - minus) * pitRate[i]) / 100;
            return taxAmount;
        }
    }

    // If benefitAmountIncome is greater than the last tax bracket
    const taxAmount = ((benefitAmount - minus) * pitRate[pitRate.length - 1]) / 100;
    return taxAmount;
}

const calculateIncomeTaxProgresSpain =(taxBrackets, pitRate, gainNumber, plus) => {
  
  if (gainNumber <= taxBrackets[0]) {
    return ((gainNumber) * pitRate[0]) / 100;
  }
 
  for (let i = 1; i < taxBrackets.length; i++) {
    if (gainNumber <= taxBrackets[i]) {
      const taxAmount = ((gainNumber - taxBrackets[i-1]) * pitRate[i]) / 100 + plus[i-1];
      return taxAmount;
    }
  }

  // If benefitAmountIncome is greater than the last tax bracket
  const taxAmount = ((gainNumber - taxBrackets[taxBrackets.length - 1]) * pitRate[pitRate.length - 1]) / 100 + plus[plus.length - 1];
  return taxAmount;
}

function formatOut(number) {
    // Round the number using Math.round
    const roundedNumber = Math.round(number);

    // Use toLocaleString to format the number with commas
    const formattedNumber = roundedNumber.toLocaleString();

    return formattedNumber;
}

const calculateTax = () => {
    let ssrRate;
    let ssrRateE;
    let taxBrackets;
    let pitRate;

    switch (selectedCountry) {
        case "austria":
            //TOGGLE
            taxToggler.style.display = "grid"
            taxTogglerUk.style.display = "none"

            // TAX POINT

            taxPoint = isTreatmentToggle ? 'exercise+sale' : 'exercise+sale';

            //SOCIAL SECURITY CONTRIBUTIONS

            ssrRate = 30;
            ssrRateE = 17.12;

            ssc_erp_taxAmount = calculatePersentValue(benefitAmount, ssrRate);
            ssc_erp_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRate);;

            ssc_eep_taxAmount = calculatePersentValue(benefitAmount, ssrRateE);
            ssc_eep_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRateE);

            ssc_tc_taxAmount = ssc_erp_taxAmount + ssc_eep_taxAmount;
            ssc_tc_taxAmountChecked = ssc_tc_taxAmount;
            ssc_tc_taxAmountVsop = ssc_erp_taxAmountVsop + ssc_eep_taxAmountVsop;

            // INCOME TAX

            taxBrackets = [11693, 19134, 32075, 62080, 93120, 1000000];
            pitRate = [0, 20, 30, 40, 48, 50, 55];

            incomeTax = calculateIncomeTaxProgres(taxBrackets, pitRate, benefitAmountIncome, benefitAmount, ssc_eep_taxAmount);
            incomeTaxChecked = incomeTax;
            //incomeTaxChecked = calculateIncomeTaxProgres(taxBrackets, pitRate, benefitAmountIncome + benefitAmount - 3000, benefitAmount - 3000, ssc_eep_taxAmount);
            incomeTaxVsop = calculateIncomeTaxProgres(taxBrackets, pitRate, vsopBenefitAmountIncome, vsopBenefitAmount, ssc_eep_taxAmountVsop);

            // CAPITAL GAIN

            if( taxPoint === "sale" ){
                gainCapital = Math.max( sharesPriceLoc - exercisePriceLoc, 0 );
            }else{
                gainCapital = Math.max( sharesPriceLoc - valueOfSharesLoc, 0);
            }

            taxAmount = calculatePersentValue(gainCapital, 27);

            taxTipsBody.innerHTML = `
      <div>Tax rates are for 2023. They may change in the future.</div>
      <div>Personal deductions are not included. If the deductions were included, the tax bill would normally be less, not more.</div>
      <div>Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.</div>
      `
            treatmentBody.innerHTML = `
      <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
	      <li>Unfortunately there is no favourable tax treatment available.</li>
	      <li>Income of 3000 euros per employee per year is tax free if:
	      <ul role="list" class="tax-treatment-sublist">
	      	<li>if the shares are kept in deposit at the European Community bank determined by the employer and the representatives of the employees</li>
	       	<li>the shares are kept for at least 5 years after they where bought</li>
	 	<li>the employee proves every year that he still owns the shares.</li>
	      </ul>
	      </li>
      </ul>`

            break;
        case "estonia":
            //TOGGLE
            taxToggler.style.display = "grid"
            taxTogglerUk.style.display = "none"

            // TAX POINT

            taxPoint = isTreatmentToggle ? 'sale' : 'exercise';

            //SOCIAL SECURITY CONTRIBUTIONS

            ssrRate = 33;
            ssrRateE = 0;

            ssc_erp_taxAmount = calculatePersentValue(benefitAmount, ssrRate);
            ssc_erp_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRate);

            ssc_eep_taxAmount = 0;
            ssc_eep_taxAmountVsop = 0;

            ssc_tc_taxAmount = ssc_erp_taxAmount;
            ssc_tc_taxAmountChecked = 0;
            ssc_tc_taxAmountVsop = ssc_erp_taxAmountVsop;

            // INCOME TAX

            incomeTax = benefitAmount * 20 / 80;
            incomeTaxChecked = 0;
            incomeTaxVsop = vsopBenefitAmount * 20 / 100;

            // CAPITAL GAIN

            if( taxPoint === "sale" ){
                gainCapital = Math.max( sharesPriceLoc - exercisePriceLoc, 0 );
            }else{
                gainCapital = Math.max( sharesPriceLoc - valueOfSharesLoc, 0);
            }

            taxAmount = calculatePersentValue(gainCapital, 20);

            // moreButtonExercisePrice.style.display = 'inline';
            // moreButtonValueOfShares.style.display = 'inline';
            // moreButtonSalePrice.style.display = 'inline';
            // moreButtonAnnualIncome.style.display = 'none';

            taxTipsBody.innerHTML = `
      <div>Tax rates are for 2023. They may change in the future.</div>
      <div>Personal deductions are not included. If the deductions were included, the tax bill would normally be less, not more.</div>
      <div>Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.</div>
      `
            treatmentBody.innerHTML = `
      <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
	      <li>There must be at least 3 years between the grant and exercise of the share options.</li>
	      <li>The 3 years starts from the date both parties have signed the agreement.</li>
	      <li>Grant of the options has to be notified to the Estonian Tax and Customs Board, except if the time of grant can be proved by digital signature or other similar timestamp.</li>
      </ul>`

            break;
        case "cyprus":
            //TOGGLE
            taxToggler.style.display = "grid"
            taxTogglerUk.style.display = "none"

            // TAX POINT

            taxPoint = isTreatmentToggle ? 'exercise' : 'exercise';

            //SOCIAL SECURITY CONTRIBUTIONS

            ssrRate = 2.9;
            ssrRateE = 2.65;

            ssc_erp_taxAmount = calculatePersentValue(benefitAmount, ssrRate);
            ssc_erp_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRate);;

            ssc_eep_taxAmount = calculatePersentValue(benefitAmount, ssrRateE);
            ssc_eep_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRateE);

            ssc_tc_taxAmount = ssc_erp_taxAmount + ssc_eep_taxAmount;
            ssc_tc_taxAmountChecked = ssc_tc_taxAmount;
            ssc_tc_taxAmountVsop = ssc_erp_taxAmountVsop + ssc_eep_taxAmountVsop;

            // INCOME TAX

            taxBrackets = [19500, 28000, 36300, 60000];
            pitRate = [0, 20, 25, 30, 35];

            incomeTax = calculateIncomeTaxProgres(taxBrackets, pitRate, benefitAmountIncome, benefitAmount, 0);
            incomeTaxChecked = calculateIncomeTaxProgres(taxBrackets, pitRate, benefitAmountIncome, benefitAmount, 0);
            incomeTaxVsop = calculateIncomeTaxProgres(taxBrackets, pitRate, vsopBenefitAmountIncome, vsopBenefitAmount, 0);

            // CAPITAL GAIN

            if( taxPoint === "sale" ){
                gainCapital = Math.max( sharesPriceLoc - exercisePriceLoc, 0 );
            }else{
                gainCapital = Math.max( sharesPriceLoc - valueOfSharesLoc, 0);
            }

            taxAmount = calculatePersentValue(gainCapital, 0);

            // TEXT IN BUBBLE

            // moreButtonExercisePrice.style.display = 'inline';
            // moreButtonValueOfShares.style.display = 'inline';
            // moreButtonSalePrice.style.display = 'none';
            // moreButtonAnnualIncome.style.display = 'none';

            taxTipsBody.innerHTML = `
      <div>Tax rates are for 2023. They may change in the future.</div>
      <div>Progressive rates are taken into account, but personal deductions are not. If the personal deductions were included, the tax bill would normally be less, not more.</div>
      <div>Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.</div>
      `
            treatmentBody.innerHTML = `
      <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
	      <li>Unfortunately there is no favourable tax treatment available.</li>
	      <li>Sale of shares is generally tax free unless you sell shares in a company that holds immovable property in Cyprus.</li>
      </ul>`

            break;
        case "germany"://TOGGLE
            taxToggler.style.display = "grid"
            taxTogglerUk.style.display = "none"

            // TAX POINT 
      
      taxPoint = isTreatmentToggle ? 'sale' : 'exercise';
      
      //SOCIAL SECURITY CONTRIBUTIONS
      
      ssrRate = 21;
      ssrRateE = 18;
      
      taxBrackets = [11604, 17005, 66760, 277825];
      const yDe = (benefitAmountIncome - taxBrackets[0])/10000;
      const zDe = (benefitAmountIncome - taxBrackets[1])/10000;
      const yDeVSOP = (vsopBenefitAmountIncome - taxBrackets[0])/10000;
      const zDeVSOP = (vsopBenefitAmountIncome - taxBrackets[1])/10000;
      
      const bracketB = ( 922.98 * yDe + 1400 ) * yDe;
      const bracketC = ( 181.19 * zDe + 2397 ) * zDe + 1025.38;
      const bracketBVSOP = ( 922.98 * yDeVSOP + 1400 ) * yDeVSOP;
      const bracketCVSOP = ( 181.19 * zDeVSOP + 2397 ) * zDeVSOP + 1025.38;
      
      pitRate = [0, 
                 bracketB/(benefitAmountIncome-10908)*100, 
                 bracketC/(benefitAmountIncome-10908)*100, 
                 42, 45]
      let otherAnnualIncomePIT;
      
      benefitAnnualIncomePIT = calculateIncomeTaxProgres(taxBrackets, pitRate, benefitAmountIncome, benefitAmountIncome, 0); 
      
      otherAnnualIncomePIT = calculateIncomeTaxProgres(taxBrackets, pitRate, annualIncomeLoc, annualIncomeLoc, 0); 
      
      if (benefitAmountIncome <= 66760){
        benefitAnnualIncomePIT = benefitAnnualIncomePIT
        otherAnnualIncomePIT = otherAnnualIncomePIT
      }else if (benefitAmountIncome <= 277825){
        benefitAnnualIncomePIT = benefitAnnualIncomePIT - 10602
        otherAnnualIncomePIT = otherAnnualIncomePIT - 10602
      }else if (benefitAmountIncome > 277825){
        benefitAnnualIncomePIT = benefitAnnualIncomePIT - 18937
        otherAnnualIncomePIT = otherAnnualIncomePIT - 18937
      }
      
      let vsopbenefitAnnualIncomePIT = calculateIncomeTaxProgres(taxBrackets, pitRate, vsopBenefitAmountIncome, vsopBenefitAmountIncome, 0)
      
      if (vsopBenefitAmountIncome <= 66760){
        vsopbenefitAnnualIncomePIT = vsopbenefitAnnualIncomePIT
      }else if (vsopBenefitAmountIncome <= 277825){
        vsopbenefitAnnualIncomePIT = vsopbenefitAnnualIncomePIT - 10602
      }else if (vsopBenefitAmountIncome > 277825){
        vsopbenefitAnnualIncomePIT = vsopbenefitAnnualIncomePIT - 18937
      }
      
      let ssceY
      if (benefitAmountIncome <= 62000){
        ssceY = benefitAmount / 100 * 9
      } else if (annualIncomeLoc > 62000){
        ssceY = 0
      }else if (benefitAmountIncome > 62000 && annualIncomeLoc < 62000){
        ssceY = (62000 - annualIncomeLoc) / 100 * 9
      }
      let ssceZ
      if (benefitAmountIncome <= 90000){
        ssceZ = benefitAmount / 100 * 11
      } else if (annualIncomeLoc > 90000){
        ssceZ = 0
      }else if (benefitAmountIncome > 90000 && annualIncomeLoc < 90000){
        ssceZ = (90000 - annualIncomeLoc) / 100 * 11
      }
      
      let ssceYVSOP
      if (vsopBenefitAmountIncome <= 62000){
        ssceYVSOP = vsopBenefitAmount / 100 * 9
      } else if (annualIncomeLoc > 62000){
        ssceYVSOP = 0
      }else if (vsopBenefitAmountIncome > 62000 && annualIncomeLoc < 62000){
        ssceYVSOP = (62000 - annualIncomeLoc) / 100 * 9
      }
      let ssceZVSOP
      if (vsopBenefitAmountIncome <= 90000){
        ssceZVSOP = vsopBenefitAmount / 100 * 11
      } else if (annualIncomeLoc > 90000){
        ssceZVSOP = 0
      }else if (vsopBenefitAmountIncome > 90000 && annualIncomeLoc < 90000){
        ssceZVSOP = (90000 - annualIncomeLoc) / 100 * 11
      }

      ssc_erp_taxAmount = ssceY + ssceZ;
      ssc_erp_taxAmountChecked = ssc_erp_taxAmount;
      ssc_erp_taxAmountVsop = ssceYVSOP + ssceZVSOP;

      ssc_eep_taxAmount = ssc_erp_taxAmount;
      ssc_eep_taxAmountChecked = ssc_erp_taxAmountChecked;
      ssc_eep_taxAmountVsop = ssc_erp_taxAmountVsop;

      ssc_tc_taxAmount = ssc_erp_taxAmount + ssc_eep_taxAmount;
      ssc_tc_taxAmountChecked = ssc_erp_taxAmountChecked + ssc_eep_taxAmountChecked;
      ssc_tc_taxAmountVsop = ssc_erp_taxAmountVsop + ssc_eep_taxAmountVsop;

      
      // INCOME TAX
        
      incomeTax = benefitAnnualIncomePIT - otherAnnualIncomePIT
      incomeTaxChecked = 0;
      incomeTaxVsop = vsopbenefitAnnualIncomePIT - otherAnnualIncomePIT
      
      // CAPITAL GAIN
      
      if( taxPoint === "sale" ){
        gainCapital = Math.max( sharesPriceLoc - exercisePriceLoc, 0 );
      }else{
        gainCapital = Math.max( sharesPriceLoc - valueOfSharesLoc, 0);
      }

      taxAmount = calculatePersentValue(gainCapital, 25);

            taxTipsBody.innerHTML = `
      <div>Tax rates are for 2024. They may change in the future.</div>
      <div>Progressive rates are taken into account, but personal deductions are not. If the personal deductions were included, the tax bill would normally be less, not more.</div>
      <div>Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.</div>
      <div>Church tax and solidarity surcharge are not included.</div>
      `
            treatmentBody.innerHTML = `
      <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
	      <li>From 2024, tax relief is given to employees of the company that meets following criteria:
		      <ul role="list" class="tax-treatment-sublist">
		      	<li>the company employs less than 1000 employees and its annual turnover is max 100 MEUR, balance sheet max 86 MEUR (for 7 years)</li>
		       	<li>the company is less than 20 years old</li>
		      </ul>
	      </li>
        <li>Income tax on the share options of such companies can be deferred from exercise to the earliest of one of the following events:
		      <ul role="list" class="tax-treatment-sublist">
		      	<li>sale or transfer of shares</li>
		       	<li>termination of employment agreement, or</li>
		 	      <li>15 years passed from exercise.</li>
		      </ul>
	      </li>
       <li>However, the termination of employment is not yet the tax point if the employer is ready to take the full liability to pay any possible wage tax.</li>
       <li>Employees of any company can enjoy tax allowance of 2000 eur in a year at the point of exercise.</li>
      </ul>`

            break;
      case "latvia":
        // TAX POINT 
      
      taxPoint = isTreatmentToggle ? 'sale' : 'exercise';
      
      //SOCIAL SECURITY CONTRIBUTIONS
      
      ssrRate = 23.59;
      ssrRateE = 10.5;
      
      console.log('benefitAmount', benefitAmount)
      console.log('benefitAmountIncome', benefitAmountIncome)
      console.log('annualIncomeLoc', annualIncomeLoc)
      console.log('vsopBenefitAmountIncome', vsopBenefitAmountIncome)
      console.log('vsopBenefitAmount', vsopBenefitAmount)
      
      const pitBracket = [4001, 17363]
      
      let otherAnnualIncome;
      if (annualIncomeLoc <= 20004){
        otherAnnualIncome = annualIncomeLoc * 20 / 100
      }else if ( annualIncomeLoc <= 78100){
        otherAnnualIncome = (annualIncomeLoc - 20004)*23/100 + pitBracket[0];
      }else if ( annualIncomeLoc > 78100 ){
        otherAnnualIncome = ( annualIncomeLoc - 78100 )*31/100 + pitBracket[1]
      }
      
      let benefitOtherAnnualIncome;
      if (benefitAmountIncome <= 20004){
        benefitOtherAnnualIncome = benefitAmountIncome * 20 / 100
      }else if ( benefitAmountIncome <= 78100){
        benefitOtherAnnualIncome = (benefitAmountIncome - 20004)*23/100 + pitBracket[0];
      }else if ( benefitAmountIncome > 78100 ){
        benefitOtherAnnualIncome = ( benefitAmountIncome - 78100 )*31/100 + pitBracket[1]
      }
      
      let annualIncomeVSOP;
      if (vsopBenefitAmountIncome <= 20004){
        annualIncomeVSOP = vsopBenefitAmountIncome * 20 / 100
      }else if ( vsopBenefitAmountIncome <= 78100){
        annualIncomeVSOP = (vsopBenefitAmountIncome - 20004)*23/100 + pitBracket[0];
      }else if ( vsopBenefitAmountIncome > 78100 ){
        annualIncomeVSOP = ( vsopBenefitAmountIncome - 78100 )*31/100 + pitBracket[1]
      }
      
      // INCOME TAX
      
      taxBrackets = [ 20004, 78100 ];
      pitRate = [ 20, 23, 30 ];
      
      incomeTax = benefitOtherAnnualIncome - otherAnnualIncome;
      incomeTaxChecked = 0;
      incomeTaxVsop = annualIncomeVSOP - otherAnnualIncome;
      
      const socialTaxBases = [annualIncomeLoc - otherAnnualIncome,
                              benefitAmountIncome - benefitOtherAnnualIncome,
                              benefitAmount - incomeTax,
                              vsopBenefitAmountIncome - annualIncomeVSOP,
                              vsopBenefitAmount - incomeTaxVsop
                             ]
      if (benefitAmountIncome <= 78100){
       ssc_eep_taxAmount = socialTaxBases[2]*10.5/100
      }else if (annualIncomeLoc > 78100){
        ssc_eep_taxAmount = 0;
      }else if (benefitAmountIncome > 78100 && annualIncomeLoc < 78100){
       ssc_eep_taxAmount = (78100 - socialTaxBases[0] ) * 10.5/100
      }
        
      ssc_eep_taxAmountChecked = 0;
        
      if (vsopBenefitAmountIncome <= 78100){
        ssc_eep_taxAmountVsop = socialTaxBases[4] * 10.5 / 100
      }else if (annualIncomeLoc > 78100){
        ssc_eep_taxAmountVsop = 0;
      }else if (vsopBenefitAmountIncome > 78100 && annualIncomeLoc < 78100){
        ssc_eep_taxAmountVsop = ( 78100 - annualIncomeLoc ) * 10.5 / 100
      }
      
      if (benefitAmountIncome <= 78100){
        ssc_erp_taxAmount = socialTaxBases[2] * 23.59 / 100;
      }else if (annualIncomeLoc > 78100){
        ssc_erp_taxAmount = 0;
      }else if (benefitAmountIncome > 78100 && annualIncomeLoc < 78100){
        ssc_erp_taxAmount = ( 78100 - annualIncomeLoc ) * 23.59 / 100;
      }
      
      ssc_erp_taxAmountChecked = 0;
      
      if (annualIncomeLoc > 16065){
        ssc_erp_taxAmountVsop = 0;
      }else if (vsopBenefitAmountIncome < 78100){
        ssc_erp_taxAmountVsop = socialTaxBases[4] * 23.59 / 100
      }else if (vsopBenefitAmountIncome > 78100 && annualIncomeLoc < 78100){
        ssc_erp_taxAmountVsop = ( 78100 - annualIncomeLoc ) * 23.59 / 100;
      }

      ssc_tc_taxAmount = 0;
      ssc_tc_taxAmountChecked = 0;
      ssc_tc_taxAmountVsop = 0;
      
      // CAPITAL GAIN
      
      if( taxPoint === "sale" ){
        gainCapital = Math.max( sharesPriceLoc - exercisePriceLoc, 0 );
      }else{
        gainCapital = Math.max( sharesPriceLoc - valueOfSharesLoc, 0);
      }
      
      taxAmount = calculatePersentValue(gainCapital, 20);

            taxTipsBody.innerHTML = `
      <div>Tax rates are for 2024. They may change in the future.</div>
      <div>Progressive rates are taken into account, but personal deductions are not. If the personal deductions were included, the tax bill would normally be less, not more.</div>
      <div>Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.</div>
      <div>Solidarity tax of 25% must be paid if annual income exceeds 78,100 EUR. This is not included in the calculation.</div>
      `
            treatmentBody.innerHTML = `
      <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
	      <li>There must be at least 1 year between the grant and exercise of the share options.</li>
	      <li>During the options are held, the optionholder must be employed by the company.</li>
	      <li>Grant of options must be notified to the Latvian State Revenue service within 2 months.</li>
      </ul>`

            break;
        case "lithuania":
            //TOGGLE
            taxToggler.style.display = "grid"
            taxTogglerUk.style.display = "none"

            // TAX POINT

            taxPoint = isTreatmentToggle ? 'sale' : 'exercise';

            //SOCIAL SECURITY CONTRIBUTIONS

            ssrRate = 1.77;
            ssrRateE = 19.5;

            ssc_erp_taxAmount = calculatePersentValue(benefitAmount, ssrRate);
            ssc_erp_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRate);;

            ssc_eep_taxAmount = benefitAmountIncome < 101094 ? calculatePersentValue(benefitAmount, ssrRateE) : calculatePersentValue(benefitAmount, 6.98);
            ssc_eep_taxAmountVsop = vsopBenefitAmountIncome < 101094 ? calculatePersentValue(vsopBenefitAmount, ssrRateE) : calculatePersentValue(vsopBenefitAmount, 6.98);

            ssc_tc_taxAmount = ssc_erp_taxAmount + ssc_eep_taxAmount;
            ssc_tc_taxAmountChecked = 0;
            ssc_tc_taxAmountVsop = ssc_erp_taxAmountVsop + ssc_eep_taxAmountVsop;

            // INCOME TAX

            taxBrackets = [ 101094, 202188 ];
            pitRate = [ 20, 32, 32 ];

            incomeTax = calculateIncomeTaxProgres(taxBrackets, pitRate, benefitAmountIncome, benefitAmount, 0);
            incomeTaxChecked = 0;
            incomeTaxVsop = calculateIncomeTaxProgres(taxBrackets, pitRate, vsopBenefitAmountIncome, vsopBenefitAmount, 0);

            // CAPITAL GAIN

            if( taxPoint === "sale" ){
                gainCapital = Math.max( sharesPriceLoc - exercisePriceLoc, 0 );
            }else{
                gainCapital = Math.max( sharesPriceLoc - valueOfSharesLoc, 0);
            }

            if( gainCapital < 202188 ){
                taxAmount = calculatePersentValue(gainCapital, 15);
            }else{
                taxAmount = ( gainCapital - 202188 ) * 20 / 100 + calculatePersentValue( 202188, 15 )
            }

            // TEXT IN BUBBLE

            // moreButtonExercisePrice.style.display = 'inline';
            // moreButtonValueOfShares.style.display = 'inline';
            // moreButtonSalePrice.style.display = 'inline';
            // moreButtonAnnualIncome.style.display = 'inline';

            taxTipsBody.innerHTML = `
      <div>Tax rates are for 2023. They may change in the future. </div>
      <div>Progressive rates are taken into account, but personal deductions are not. If the personal deductions were included, the tax bill would normally be less, not more.</div>
      <div>Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.</div>
      <div>Social security contribution amount is average since it depends on personal circumstances or choices.</div>
      `
            treatmentBody.innerHTML = `
      <div class="text is--color-neutral-900 is--caption is--regular">
	      There must be at least 3 years between the grant and exercise of the share options.
      </div>`

            break;
        case "malta":
            //TOGGLE
            taxToggler.style.display = "grid"
            taxTogglerUk.style.display = "none"

            // TAX POINT

            taxPoint = isTreatmentToggle ? 'exercise+sale' : 'exercise+sale';

            //SOCIAL SECURITY CONTRIBUTIONS

            ssc_erp_taxAmount = 0;
            ssc_erp_taxAmountVsop = 0;

            ssc_eep_taxAmount = 0;
            ssc_eep_taxAmountVsop = 0;

            ssc_tc_taxAmount = 0;
            ssc_tc_taxAmountChecked = 0;
            ssc_tc_taxAmountVsop = 0;

            // INCOME TAX

            incomeTax = calculatePersentValue(benefitAmount, 15);
            incomeTaxChecked = incomeTax;
            incomeTaxVsop = calculatePersentValue(vsopBenefitAmount, 15);

            // CAPITAL GAIN

            if( taxPoint === "sale" ){
                gainCapital = Math.max( sharesPriceLoc - exercisePriceLoc, 0 );
            }else{
                gainCapital = Math.max( sharesPriceLoc - valueOfSharesLoc, 0);
            }

            taxAmount = calculatePersentValue(gainCapital, 15);

            // TEXT IN BUBBLE

            // moreButtonExercisePrice.style.display = 'inline';
            // moreButtonValueOfShares.style.display = 'inline';
            // moreButtonSalePrice.style.display = 'none';
            // moreButtonAnnualIncome.style.display = 'none';

            taxTipsBody.innerHTML = `
      <div>Tax rates are for 2023. They may change in the future.</div>
      <div>Personal deductions are not included.If the deductions were included, the tax bill would normally be less, not more.</div>
      <div>Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.</div>
      `
            treatmentBody.innerHTML = `
      <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
	      <li>Only company and group company employees can participate.</li>
	      <li>Benefit on the exercise is taxed with income tax of 15%. Progressive rates do not apply. No social security contributions.</li>
	      <li>Company has to collect and keep the records to be able to prove the correct valuation of fringe benefits.</li>
      </ul>`

            break;
        case "netherlands":
            //TOGGLE
            taxToggler.style.display = "grid"
            taxTogglerUk.style.display = "none"


            // TAX POINT

            taxPoint = isTreatmentToggle ? 'exercise' : 'exercise';

            //SOCIAL SECURITY CONTRIBUTIONS

            ssrRate = 11.78;
            ssrRateE = 6.68;

            ssc_erp_taxAmount = benefitAmountIncome < 66956 ? calculatePersentValue(benefitAmount, ssrRate) : 0;
            ssc_erp_taxAmountVsop = vsopBenefitAmountIncome < 66956 ? calculatePersentValue(vsopBenefitAmount, ssrRate) : 0;

            ssc_eep_taxAmount = benefitAmountIncome < 66956 ? calculatePersentValue(benefitAmount, ssrRateE) : 0;
            ssc_eep_taxAmountVsop = vsopBenefitAmountIncome < 66956 ? calculatePersentValue(vsopBenefitAmount, ssrRateE) : 0;

            ssc_tc_taxAmount = ssc_erp_taxAmount + ssc_eep_taxAmount;
            ssc_tc_taxAmountChecked = ssc_tc_taxAmount;
            ssc_tc_taxAmountVsop = ssc_erp_taxAmountVsop + ssc_eep_taxAmountVsop;

            // INCOME TAX

            taxBrackets = [ 37149, 73031 ];
            pitRate = [ 9.28, 36.93, 49.5 ];

            incomeTax = calculateIncomeTaxProgres(taxBrackets, pitRate, benefitAmountIncome, benefitAmount, 0);
            incomeTaxChecked = calculateIncomeTaxProgres(taxBrackets, pitRate, benefitAmountIncome, benefitAmount, 0);
            incomeTaxVsop = calculateIncomeTaxProgres(taxBrackets, pitRate, vsopBenefitAmountIncome, vsopBenefitAmount, 0);

            // CAPITAL GAIN

            if( taxPoint === "sale" ){
                gainCapital = Math.max( sharesPriceLoc - exercisePriceLoc, 0 );
            }else{
                gainCapital = Math.max( sharesPriceLoc - valueOfSharesLoc, 0);
            }

            taxAmount = calculatePersentValue(gainCapital, 0);

            // TEXT IN BUBBLE

            // moreButtonExercisePrice.style.display = 'inline';
            // moreButtonValueOfShares.style.display = 'inline';
            // moreButtonSalePrice.style.display = 'inline';
            // moreButtonAnnualIncome.style.display = 'inline';

            taxTipsBody.innerHTML = `
      <div>Tax rates are for 2023. They may change in the future.</div>
      <div>Progressive rates are taken into account, but personal deductions are not. If the personal deductions were included, the tax bill would normally be less, not more.</div>
      <div>Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.</div>
      <div>Social security contributions amount is approximate since the payments are capped depending on the exact amount of salary.</div>
      `
            treatmentBody.innerHTML = `
      <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
      	      <li>No special treatment for ESOP plans.</li>
	      <li>New tax rules for stock options apply from 1 January 2023:
		      <ul role="list" class="tax-treatment-sublist">
		      	<li>The tax point is at the exercise if the shares become tradable, i.e. the owner is able to sell the shares to any other person.</li>
		      </ul>
	      </li>
      </ul>`

            break;
        case "czechia":
            //TOGGLE
            taxToggler.style.display = "grid"
            taxTogglerUk.style.display = "none"

            // TAX POINT

            taxPoint = isTreatmentToggle ? 'exercise+sale' : 'exercise+sale';

            //SOCIAL SECURITY CONTRIBUTIONS

            ssrRate = 33.8;
            ssrRateE = 11;

            ssc_erp_taxAmount = calculatePersentValue(benefitAmount, ssrRate);
            ssc_erp_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRate);;

            ssc_eep_taxAmount = calculatePersentValue(benefitAmount, ssrRateE);
            ssc_eep_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRateE);

            ssc_tc_taxAmount = ssc_erp_taxAmount + ssc_eep_taxAmount;
            ssc_tc_taxAmountChecked = ssc_tc_taxAmount;
            ssc_tc_taxAmountVsop = ssc_erp_taxAmountVsop + ssc_eep_taxAmountVsop;

            // INCOME TAX

            taxBrackets = [ 1935552 ];
            pitRate = [ 15, 23 ];

            incomeTax = calculateIncomeTaxProgres(taxBrackets, pitRate, benefitAmountIncome, benefitAmount, 0);
            incomeTaxChecked = calculateIncomeTaxProgres(taxBrackets, pitRate, benefitAmountIncome, benefitAmount, 0);
            incomeTaxVsop = calculateIncomeTaxProgres(taxBrackets, pitRate, vsopBenefitAmountIncome, vsopBenefitAmount, 0);

            // CAPITAL GAIN

            if( taxPoint === "sale" ){
                gainCapital = Math.max( sharesPriceLoc - exercisePriceLoc, 0 );
            }else{
                gainCapital = Math.max( sharesPriceLoc - valueOfSharesLoc, 0);
            }

            taxAmount = calculatePersentValue(gainCapital, 15);

            // TEXT IN BUBBLE

            // moreButtonExercisePrice.style.display = 'inline';
            // moreButtonValueOfShares.style.display = 'inline';
            // moreButtonSalePrice.style.display = 'inline';
            // moreButtonAnnualIncome.style.display = 'none';

            taxTipsBody.innerHTML = `
      <div>Tax rates are for 2023. They may change in the future. </div>
      <div>Progressive rates are taken into account, but personal deductions are not. If the personal deductions were included, the tax bill would normally be less, not more.</div>
      <div>Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.</div>
      `
            treatmentBody.innerHTML = `
      <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
	      <li>Unfortunately there is no favourable tax treatment available.</li>
          <li>Sale of share is tax free if the shares are held for 3+ years.</li>
      </ul>`

            break;
        case "denmark":
            //TOGGLE
            taxToggler.style.display = "grid"
            taxTogglerUk.style.display = "none"

            // TAX POINT

            taxPoint = isTreatmentToggle ? 'sale' : 'exercise';

            //SOCIAL SECURITY CONTRIBUTIONS

            ssc_erp_taxAmount = 0;
            ssc_erp_taxAmountVsop = 0;

            ssc_eep_taxAmount = 0;
            ssc_eep_taxAmountVsop = 0;

            ssc_tc_taxAmount = 0;
            ssc_tc_taxAmountChecked = 0;
            ssc_tc_taxAmountVsop = 0;

            // INCOME TAX

            taxBrackets = [ 1935552 ];
            pitRate = [ 15, 23 ];

            const denmarkTaxInc = calculateIncomeTaxProgres( [ 568900 ], [ 12.09, 15 ], benefitAmountIncome, benefitAmount, 0) + calculatePersentValue( benefitAmount, 25.018) + calculatePersentValue( benefitAmount, 8 );
            const vsopDenmarkTaxInc = calculateIncomeTaxProgres( [ 568900 ], [ 12.09, 15 ], vsopBenefitAmountIncome, vsopBenefitAmount, 0) + calculatePersentValue( vsopBenefitAmount, 25.018) + calculatePersentValue( vsopBenefitAmount, 8 )

            incomeTax = denmarkTaxInc;
            incomeTaxChecked = 0;
            incomeTaxVsop = vsopDenmarkTaxInc;

            // CAPITAL GAIN

            if( taxPoint === "sale" ){
                gainCapital = Math.max( sharesPriceLoc - exercisePriceLoc, 0 );
            }else{
                gainCapital = Math.max( sharesPriceLoc - valueOfSharesLoc, 0);
            }

            if( gainCapital <= 58900 ){
                taxAmount = calculatePersentValue(gainCapital, 27);
            }else{
                taxAmount = ( gainCapital - 58900 ) * 42 / 100 + calculatePersentValue( 58900, 27 )
            }

            // TEXT IN BUBBLE

            // moreButtonExercisePrice.style.display = 'inline';
            // moreButtonValueOfShares.style.display = 'inline';
            // moreButtonSalePrice.style.display = 'inline';
            // moreButtonAnnualIncome.style.display = 'inline';

            taxTipsBody.innerHTML = `
      <div>Tax rates are for 2023. They may change in the future. </div>
      <div>Progressive rates are taken into account, but personal deductions are not. If the personal deductions were included, the tax bill would normally be less, not more.</div>
      <div>Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.</div>
      <div>Social security contributions are not included since they are almost nonexistent or depend on personal choices. Municipal tax and labour market tax are included.</div>
      `
            treatmentBody.innerHTML = `
      <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
	      <li>Tax relief is available for individual share-based remuneration plans ("section 7P").</li>
          <li>Only employees are eligible. Cannot be applied to contractors, board members etc.</li>
	      <li>Shares should be issued by the employer or the group company.</li>
          <li>Employee shares cannot constitute a separate class of shares.</li>
	      <li>Allocated options cannot be assigned to anyone else.</li>
          <li>Allocation must not exceed 10% of the annual salary. Exceptions apply to start-ups and if plan is offered to 80% of the employees.</li>
	      <li>Grant of options needs to be notified to the Tax Agency.</li>
      </ul>`

            break;
        case "poland":
            //TOGGLE
            taxToggler.style.display = "grid"
            taxTogglerUk.style.display = "none"

            // TAX POINT

            taxPoint = isTreatmentToggle ? 'sale' : 'exercise';

            //SOCIAL SECURITY CONTRIBUTIONS

            ssrRate = 22.14;
            ssrRateE = 22.71;

            ssc_erp_taxAmount = calculatePersentValue(benefitAmount, ssrRate);
            ssc_erp_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRate);;

            ssc_eep_taxAmount = calculatePersentValue(benefitAmount, ssrRateE);
            ssc_eep_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRateE);

            ssc_tc_taxAmount = ssc_erp_taxAmount + ssc_eep_taxAmount;
            ssc_tc_taxAmountChecked = 0;
            ssc_tc_taxAmountVsop = ssc_erp_taxAmountVsop + ssc_eep_taxAmountVsop;

            // INCOME TAX

            taxBrackets = [ 120000 ];
            pitRate = [ 12, 32 ];

            incomeTax = calculateIncomeTaxProgres(taxBrackets, pitRate, benefitAmountIncome, benefitAmount, 0);
            incomeTaxChecked = 0;
            incomeTaxVsop = calculateIncomeTaxProgres(taxBrackets, pitRate, vsopBenefitAmountIncome, vsopBenefitAmount, 0);

            // CAPITAL GAIN

            if( taxPoint === "sale" ){
                gainCapital = Math.max( sharesPriceLoc - exercisePriceLoc, 0 );
            }else{
                gainCapital = Math.max( sharesPriceLoc - valueOfSharesLoc, 0);
            }

            taxAmount = calculatePersentValue(gainCapital, 19);

            // TEXT IN BUBBLE

            // moreButtonExercisePrice.style.display = 'inline';
            // moreButtonValueOfShares.style.display = 'inline';
            // moreButtonSalePrice.style.display = 'inline';
            // moreButtonAnnualIncome.style.display = 'inline';

            taxTipsBody.innerHTML = `
      <div>Tax rates are for 2023. They may change in the future. </div>
      <div>Progressive rates are taken into account, but personal deductions are not. If the personal deductions were included, the tax bill would normally be less, not more.</div>
      <div>Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.</div>
      <div>Social security contributions amount is average since it depends on personal circumstances or choices.</div>
      `
            treatmentBody.innerHTML = `
      <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
        <li>The issuer of the shares is a joint stock company.</li>
        <li>The company is based in Poland or in another EU or EEA country, or in the country with which Poland has a tax treaty.</li>
        <li>Awards are granted based on the shareholders resolution.</li>
        <li>Tax advantage applies to incentive plans that correspond to the definition in the Polish income tax law.</li>
      </ul>`

            break;
        case "georgia":
            //TOGGLE
            taxToggler.style.display = "grid"
            taxTogglerUk.style.display = "none"

            // TAX POINT

            taxPoint = isTreatmentToggle ? 'grant or exercise+sale' : 'grant or exercise+sale';

            //SOCIAL SECURITY CONTRIBUTIONS

            ssrRate = 2;
            ssrRateE = 2;

            ssc_erp_taxAmount = calculatePersentValue(benefitAmount, ssrRate);
            ssc_erp_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRate);;

            ssc_eep_taxAmount = calculatePersentValue(benefitAmount, ssrRateE);
            ssc_eep_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRateE);

            ssc_tc_taxAmount = ssc_erp_taxAmount + ssc_eep_taxAmount;
            ssc_tc_taxAmountChecked = ssc_tc_taxAmount;
            ssc_tc_taxAmountVsop = ssc_erp_taxAmountVsop + ssc_eep_taxAmountVsop;

            // INCOME TAX

            incomeTax = calculatePersentValue(benefitAmount, 20);
            incomeTaxChecked = incomeTax;
            incomeTaxVsop = calculatePersentValue(vsopBenefitAmount, 20);

            // CAPITAL GAIN

            if( taxPoint === "sale" ){
                gainCapital = Math.max( sharesPriceLoc - exercisePriceLoc, 0 );
            }else{
                gainCapital = Math.max( sharesPriceLoc - valueOfSharesLoc, 0);
            }

            taxAmount = calculatePersentValue(gainCapital, 20);

            // TEXT IN BUBBLE

            // moreButtonExercisePrice.style.display = 'inline';
            // moreButtonValueOfShares.style.display = 'inline';
            // moreButtonSalePrice.style.display = 'none';
            // moreButtonAnnualIncome.style.display = 'none';

            taxTipsBody.innerHTML = `
	      <div>Tax rates are for 2023. They may change in the future. </div>
	      <div>Personal deductions are not included.If the deductions were included, the tax bill would normally be less, not more.</div>
	      <div>Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.</div>
	      `
            treatmentBody.innerHTML = `
	      <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
            <li>There is no special tax treatment for employee stock options.</li>
            <li>Stock options are considered taxable benefits given by the employer to the employee.</li>
            <li>Double taxation of the same income at exercise and sale might occur.</li>
            <li>Sale of share is tax free if the shares are held for 2+ years.</li>	
	      </ul>`

            break;
        case "romania":
            //TOGGLE
            taxToggler.style.display = "grid"
            taxTogglerUk.style.display = "none"

            // TAX POINT

            taxPoint = isTreatmentToggle ? 'sale' : 'exercise';

            //SOCIAL SECURITY CONTRIBUTIONS

            ssrRate = 2.25;
            ssrRateE = 25;

            ssc_erp_taxAmount = calculatePersentValue(benefitAmount, ssrRate);
            ssc_erp_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRate);;

            ssc_eep_taxAmount = calculatePersentValue(benefitAmount, ssrRateE);
            ssc_eep_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRateE);

            ssc_tc_taxAmount = ssc_erp_taxAmount + ssc_eep_taxAmount + calculatePersentValue(benefitAmount, 10);
            ssc_tc_taxAmountChecked = 0;
            ssc_tc_taxAmountVsop = ssc_erp_taxAmountVsop + ssc_eep_taxAmountVsop + calculatePersentValue(vsopBenefitAmount, 10);

            // INCOME TAX

            incomeTax = calculatePersentValue(benefitAmount, 10);
            incomeTaxChecked = 0;
            incomeTaxVsop = calculatePersentValue(vsopBenefitAmount, 10);

            // CAPITAL GAIN

            if( taxPoint === "sale" ){
                gainCapital = Math.max( sharesPriceLoc - exercisePriceLoc, 0 );
            }else{
                gainCapital = Math.max( sharesPriceLoc - valueOfSharesLoc, 0);
            }

            if( gainCapital >18000 && gainCapital <36000 ){
                taxAmount = calculatePersentValue(gainCapital, 10) + calculatePersentValue(gainCapital, 10);
            }else{
                taxAmount = calculatePersentValue(gainCapital, 10);
            }

            // TEXT IN BUBBLE

            // moreButtonExercisePrice.style.display = 'inline';
            // moreButtonValueOfShares.style.display = 'inline';
            // moreButtonSalePrice.style.display = 'inline';
            // moreButtonAnnualIncome.style.display = 'none';

            taxTipsBody.innerHTML = `
      <div>Tax rates are for 2023. They may change in the future. </div>
      <div>Personal deductions are not included.If the deductions were included, the tax bill would normally be less, not more.</div>
      <div>Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.</div>
      `
            treatmentBody.innerHTML = `
      <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
        <li>There must be at least 1 year between the grant and exercise of the share options.</li>
        <li>Employees and directors are eligible. Contractors and other collaborators are not.</li>
        <li>ESOP should be implemented by the same company which shares are offered.</li>
        <li>Health insurance (10%) is due on capital gains between 6 and 12 minimum gross salaries (3000 RON in 2023)</li>
      </ul>`

            break;
        case "ukraine":
            //TOGGLE
            taxToggler.style.display = "grid"
            taxTogglerUk.style.display = "none"

            // TAX POINT

            taxPoint = isTreatmentToggle ? 'exercise+sale' : 'exercise+sale';

            //SOCIAL SECURITY CONTRIBUTIONS

            ssrRate = 22;
            ssrRateE = 0;

            ssc_erp_taxAmount = calculatePersentValue(benefitAmount, ssrRate);
            ssc_erp_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRate);;

            ssc_eep_taxAmount = 0;
            ssc_eep_taxAmountVsop = 0;

            ssc_tc_taxAmount = ssc_erp_taxAmount + ssc_eep_taxAmount;
            ssc_tc_taxAmountChecked = ssc_tc_taxAmount;
            ssc_tc_taxAmountVsop = ssc_erp_taxAmountVsop + ssc_eep_taxAmountVsop;

            // INCOME TAX

            incomeTax = calculatePersentValue(benefitAmount, 18);
            incomeTaxChecked = incomeTax;
            incomeTaxVsop = calculatePersentValue(vsopBenefitAmount, 18);

            // CAPITAL GAIN

            if( taxPoint === "sale" ){
                gainCapital = Math.max( sharesPriceLoc - exercisePriceLoc, 0 );
            }else{
                gainCapital = Math.max( sharesPriceLoc - valueOfSharesLoc, 0);
            }

            taxAmount = calculatePersentValue(gainCapital, 18);

            // TEXT IN BUBBLE

            taxTipsBody.innerHTML = `
      <div>Tax rates are for 2023. They may change in the future. </div>
      <div>Personal deductions are not included.If the deductions were included, the tax bill would normally be less, not more.</div>
      <div>Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.</div>
      `
            treatmentBody.innerHTML = `
      <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
	    <li>Unfortunately there is no favourable tax treatment available.</li>
       	<li>Double taxation of the same income at exercise and sale might occur.</li>
      </ul>`

            break;
        case "uk":
            //TOGGLE
            taxToggler.style.display = "none"
            taxTogglerUk.style.display = "grid"

            // TAX POINT

            taxPoint = isTreatmentToggle ? 'sale' : 'exercise+sale';

            //SOCIAL SECURITY CONTRIBUTIONS

            ssrRate = 13.8;
            ssrRateE = 2.65;

            ssc_erp_taxAmount = calculatePersentValue(benefitAmount, ssrRate);
            ssc_erp_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRate);;

            ssc_eep_taxAmount = calculateIncomeTaxProgres([1047, 4188, 4189], [0, 12, 2], benefitAmountIncome, benefitAmount, 0);
            ssc_eep_taxAmountVsop = calculateIncomeTaxProgres([1047, 4188, 4189], [0, 12, 2], vsopBenefitAmountIncome, vsopBenefitAmount, 0);

            ssc_tc_taxAmount = ssc_erp_taxAmount + ssc_eep_taxAmount;
            ssc_tc_taxAmountChecked = 0;
            ssc_tc_taxAmountVsop = ssc_erp_taxAmountVsop + ssc_eep_taxAmountVsop;

            // INCOME TAX

            taxBrackets = [12570, 50270, 125140];
            pitRate = [0, 20, 40, 45];

            incomeTax = calculateIncomeTaxProgres(taxBrackets, pitRate, benefitAmountIncome, benefitAmount, 0);
            incomeTaxChecked = 0;
            incomeTaxVsop = calculateIncomeTaxProgres(taxBrackets, pitRate, vsopBenefitAmountIncome, vsopBenefitAmount, 0);

            // CAPITAL GAIN

            if( taxPoint === "sale" ){
                gainCapital = Math.max( sharesPriceLoc - exercisePriceLoc, 0 );
            }else{
                gainCapital = Math.max( sharesPriceLoc - valueOfSharesLoc, 0);
            }

            if (csopCheckboxUk.checked){
                taxAmount = gainCapital < 50271 ? calculatePersentValue(gainCapital, 10) : calculatePersentValue(gainCapital - 6000, 20);
                taxTipsBody.innerHTML = `
                  <div>Tax rates and bands are for 2023/2024. They have changed in the past and may change in the future. </div>
                  <div>Progressive tax rates and standard personal allowances are taken into account. Scottish rates are not included.</div>
                  <div>Employer part of National Insurance Contribution is deducted from the employee's gain. This needs HMRC approval.</div>
                  `
                treatmentBody.innerHTML = `
                  <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
                    <li>The exercise price should equal the actual market value of the share fixed at grant and approved by HMRC.</li>
                    <li>Exercise of options from 3 to 10 years from grant. Certain good leavers can exercise earlier than 3 years without losing tax relief.</li>
                    <li>CSOP options can be given to any employees or full-time directors</li>
                    <li>Each participant can be given maximum £60 000 worth of shares.</li>
                    <li>CSOP plan must be registered with the HMRC by the 6 July following the tax year in which options are first granted. (NB! UK tax years starts on 6 April).</li>
                    <li>Tax advantage is lost if the employment ends before the shares are sold.</li>
                  </ul>`
            }else{
                taxAmount = calculatePersentValue(gainCapital, 10);
                taxTipsBody.innerHTML = `
                  <div>Tax rates and bands are for 2023/2024. They have changed in the past and may change in the future. </div>
                  <div>Progressive tax rates and standard personal allowances are taken into account. Scottish rates are not included.</div>
                  <div>Employer part of National Insurance Contribution is deducted from the employee's gain. This needs HMRC approval.</div>
                  `
                treatmentBody.innerHTML = `
                  <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
                    <li>The exercise price should equal the actual market value of the share fixed at grant. Exercise price must be agreed with the HMRC.</li>
                    <li>Company giving the options should have less than 250 employees and less than £30 million assets (limits apply to entire group)</li>
                    <li>Company must not have main activity such as banking, farming, shipbuilding, property development or provision of legal services.</li>
                    <li>Grant of EMI options should be notified to the HMRC. Company is obliged to report EMI scheme each year.</li>
                    <li>Foreign companies can give tax-advantage EMI options to UK employees if the company has business or permanent establishment in the UK</li>
                  </ul>`
            }

            break;
        case "bulgaria":
            // TAX POINT

            taxPoint = isTreatmentToggle ? 'exercise+sale' : 'exercise+sale';

            //SOCIAL SECURITY CONTRIBUTIONS

            ssrRate = 19;
            ssrRateE = 13.78;

            ssc_erp_taxAmount = calculatePersentValue(benefitAmount, ssrRate);
            ssc_erp_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRate);;

            ssc_eep_taxAmount = calculatePersentValue(benefitAmount, ssrRateE);
            ssc_eep_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRateE);

            ssc_tc_taxAmount = ssc_erp_taxAmount + ssc_eep_taxAmount;
            ssc_tc_taxAmountChecked = ssc_tc_taxAmount;
            ssc_tc_taxAmountVsop = ssc_erp_taxAmountVsop + ssc_eep_taxAmountVsop;

            // INCOME TAX

            incomeTax = calculatePersentValue(benefitAmount-ssc_eep_taxAmount, 10);
            incomeTaxChecked = incomeTax;
            incomeTaxVsop = calculatePersentValue(vsopBenefitAmount, 10);

            // CAPITAL GAIN

            if( taxPoint === "sale" ){
                gainCapital = Math.max( sharesPriceLoc - exercisePriceLoc, 0 );
            }else{
                gainCapital = Math.max( sharesPriceLoc - valueOfSharesLoc, 0);
            }

            taxAmount = calculatePersentValue(gainCapital, 10);

            // TEXT IN BUBBLE

            // moreButtonExercisePrice.style.display = 'inline';
            // moreButtonValueOfShares.style.display = 'inline';
            // moreButtonSalePrice.style.display = 'none';
            // moreButtonAnnualIncome.style.display = 'none';

            taxTipsBody.innerHTML = `
	        <div>Tax rates are for 2023. They may change in the future. </div>
	        <div>Personal deductions are not included. If the deductions were included, the tax bill would normally be less, not more.</div>
	        <div>Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.</div>
	 	<div>Social security contribution amount is average since it depends on personal circumstances or choices.</div>
	        `
            treatmentBody.innerHTML = `
	        <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
		  <li>Unfortunately, there is no favourable tax treatment available for stock option programs. Tax laws do not regulate taxation of stock options.</li>
		  <li>It is possible that tax obligations arise already when options are granted. Taxation at grant is more likely if the options are transferrable. </li>
		  <li>Sale of shares is tax-free if the shares are listed on a regulated market within the European Economic Area.</li>
	        </ul>`

            break;
        case "croatia":
            // TAX POINT

            taxPoint = isTreatmentToggle ? 'exercise+sale' : 'exercise+sale';

            //SOCIAL SECURITY CONTRIBUTIONS

            ssrRate = 16.50;
            ssrRateE = 20;

            ssc_erp_taxAmount = 0;
            ssc_erp_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRate);;

            ssc_eep_taxAmount = 0;
            ssc_eep_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRateE);

            ssc_tc_taxAmount = ssc_erp_taxAmount + ssc_eep_taxAmount;
            ssc_tc_taxAmountChecked = ssc_tc_taxAmount;
            ssc_tc_taxAmountVsop = ssc_erp_taxAmountVsop + ssc_eep_taxAmountVsop;

            // INCOME TAX
            const supIncTaxVal1 = calculatePersentValue(benefitAmount, 20);
            const supIncTaxVal2 = calculatePersentValue(supIncTaxVal1, 18);

            const supIncTaxVsopVal1 = vsopBenefitAmount - ssc_eep_taxAmountVsop <= 47780 ? calculatePersentValue(vsopBenefitAmount-ssc_eep_taxAmountVsop, 20) : calculatePersentValue(vsopBenefitAmount-ssc_eep_taxAmountVsop, 30)
            const supIncTaxVsopVal2 = calculatePersentValue(supIncTaxVsopVal1, 18);

            incomeTax = supIncTaxVal1 + supIncTaxVal2;
            incomeTaxChecked = incomeTax;
            incomeTaxVsop = supIncTaxVsopVal1 + supIncTaxVsopVal2;

            // CAPITAL GAIN

            if( taxPoint === "sale" ){
                gainCapital = Math.max( sharesPriceLoc - exercisePriceLoc, 0 );
            }else{
                gainCapital = Math.max( sharesPriceLoc - valueOfSharesLoc, 0);
            }

            taxAmount = calculatePersentValue(gainCapital, 10);

            // TEXT IN BUBBLE

            // moreButtonExercisePrice.style.display = 'inline';
            // moreButtonValueOfShares.style.display = 'inline';
            // moreButtonSalePrice.style.display = 'none';
            // moreButtonAnnualIncome.style.display = 'none';

            taxTipsBody.innerHTML = `
	        <div>Tax rates are for 2023. They may change in the future. </div>
	        <div>Progressive rates are taken into account, but personal deductions are not. If the personal deductions were included, the tax bill would normally be less, not more.</div>
	        <div>Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.</div>
	 	<div>Municipal tax is included in the income tax amount and calculated at its current highest rate of 18% in Zagreb.</div>
	        `
            treatmentBody.innerHTML = `
	        <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
		  <li>Unfortunately there is no favourable tax treatment available for stock option programs. However, stock options taxation is regulated by tax laws.</li>
		  <li>Stock options purchased at favourable price are treated as capital income. </li>
		  <li>Such income is taxed at a flat income tax rate and it is free from social security contributions.</li>
	        </ul>`

            break;
        case "greece":
            // TAX POINT

            taxPoint = isTreatmentToggle ? 'sale' : 'exercise+sale';

            //SOCIAL SECURITY CONTRIBUTIONS

            ssrRate = 22.29;
            ssrRateE = 13.87;

            ssc_erp_taxAmount = calculatePersentValue(benefitAmount, ssrRate);
            ssc_erp_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRate);;

            ssc_eep_taxAmount = calculatePersentValue(benefitAmount, ssrRateE);
            ssc_eep_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRateE);

            ssc_tc_taxAmount = ssc_erp_taxAmount + ssc_eep_taxAmount;
            ssc_tc_taxAmountChecked = 0;
            ssc_tc_taxAmountVsop = ssc_erp_taxAmountVsop + ssc_eep_taxAmountVsop;

            // INCOME TAX

            taxBrackets = [10000, 20000, 30000, 40000];
            pitRate = [9, 22, 28, 36, 44];

            incomeTax = calculateIncomeTaxProgres(taxBrackets, pitRate, benefitAmountIncome, benefitAmount, ssc_erp_taxAmount);
            incomeTaxChecked = 0;
            incomeTaxVsop = calculateIncomeTaxProgres(taxBrackets, pitRate, vsopBenefitAmountIncome, vsopBenefitAmount, ssc_erp_taxAmountVsop);

            // CAPITAL GAIN

            if( taxPoint === "sale" ){
                gainCapital = Math.max( sharesPriceLoc - exercisePriceLoc, 0 );
            }else{
                gainCapital = Math.max( sharesPriceLoc - valueOfSharesLoc, 0);
            }

            taxAmount = calculatePersentValue(gainCapital, 15);

            // TEXT IN BUBBLE

            // moreButtonExercisePrice.style.display = 'inline';
            // moreButtonValueOfShares.style.display = 'inline';
            // moreButtonSalePrice.style.display = 'none';
            // moreButtonAnnualIncome.style.display = 'none';

            taxTipsBody.innerHTML = `
	        <div>Tax rates are for 2023. They may change in the future. </div>
	        <div>Progressive rates are taken into account, but personal deductions are not. If the personal deductions were included, the tax bill would normally be less, not more.</div>
	        <div>Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.</div>
	 	<div>Social security contribution amount is average since it depends on personal circumstances or choices.</div>
   		<div>Transfer of the listed shares is tax-free on certain conditions. Transaction tax 0,2% on the listed shares is not included.</div>
	        `
            treatmentBody.innerHTML = `
	        <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
		  <li>The options must not be exercised before 24 months from their grant date.</li>
		  <li>In case of start-up companies, the holding requirement is 36 months, but capital gains tax is 5% instead of 15% for regular company shares.</li>
		  <li>Employer has to issue a written document at the exercise which indicates the amount of the benefit and the exact grant date of options.</li>
    		  <li>If holding period is met, the benefit is treated as a capital gain. </li>
		  <li>If options are exercised before, the benefit is treated as employment income and taxed with progressive income tax rates and social security contributions.</li>
	        </ul>`

            break;
        case "hungary":
            // TAX POINT

            taxPoint = isTreatmentToggle ? 'exercise+sale' : 'exercise+sale';

            //SOCIAL SECURITY CONTRIBUTIONS

            ssrRate = 13;
            ssrRateE = 18.50;

            ssc_erp_taxAmount = calculatePersentValue(benefitAmount, ssrRate);
            ssc_erp_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, 15);

            ssc_eep_taxAmount = calculatePersentValue(benefitAmount, ssrRateE);
            ssc_eep_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRateE);

            ssc_tc_taxAmount = ssc_erp_taxAmount + ssc_eep_taxAmount;
            ssc_tc_taxAmountChecked = ssc_tc_taxAmount;
            ssc_tc_taxAmountVsop = ssc_erp_taxAmountVsop + ssc_eep_taxAmountVsop;

            // INCOME TAX

            incomeTax = calculatePersentValue(benefitAmount, 15);
            incomeTaxChecked = incomeTax;
            incomeTaxVsop = calculatePersentValue(vsopBenefitAmount, 15);

            // CAPITAL GAIN

            if( taxPoint === "sale" ){
                gainCapital = Math.max( sharesPriceLoc - exercisePriceLoc, 0 );
            }else{
                gainCapital = Math.max( sharesPriceLoc - valueOfSharesLoc, 0);
            }

            taxAmount = calculatePersentValue(gainCapital, 15);

            // TEXT IN BUBBLE

            // moreButtonExercisePrice.style.display = 'inline';
            // moreButtonValueOfShares.style.display = 'inline';
            // moreButtonSalePrice.style.display = 'none';
            // moreButtonAnnualIncome.style.display = 'none';

            taxTipsBody.innerHTML = `
	        <div>Tax rates are for 2023. They may change in the future. </div>
	        <div>Personal allowances and deductions are not included.</div>
	        <div>Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.</div>
	        `
            treatmentBody.innerHTML = `
	        <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
		  <li>Unfortunately, there is no favourable tax treatment available for stock option programs.</li>
		  <li>It is possible that tax obligations arise already when options are granted. </li>
		  <li>Taxation at grant is more likely if the options are transferrable.</li>
	        </ul>`

            break;
        case "belgium":
            // TAX POINT

            taxPoint = isTreatmentToggle ? 'grant' : 'exercise';

            //SOCIAL SECURITY CONTRIBUTIONS

            ssrRate = 28;
            ssrRateE = 13.07;

            ssc_erp_taxAmount = calculatePersentValue(benefitAmount, ssrRate);
            ssc_erp_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRate);

            ssc_eep_taxAmount = calculatePersentValue(benefitAmount, ssrRateE);
            ssc_eep_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRateE);

            ssc_tc_taxAmount = ssc_erp_taxAmount + ssc_eep_taxAmount;
            ssc_tc_taxAmountChecked = ( valueOfSharesGrantLoc - exercisePriceLoc ) > 0 ? calculatePersentValue( valueOfSharesGrantLoc - exercisePriceLoc, ssrRateE) : 0;
            ssc_tc_taxAmountVsop = ssc_erp_taxAmountVsop + ssc_eep_taxAmountVsop;

            // HELP VALUES

            const helpValue = (valueOfSharesGrantLoc * 0.09) + ( valueOfSharesGrantLoc - exercisePriceLoc - ssc_tc_taxAmountChecked ) > 0 ? valueOfSharesGrantLoc - exercisePriceLoc - ssc_tc_taxAmountChecked : 0;
            const helpValueBenefitAmount = helpValue + valueOfSharesGrantLoc * 0.09;
            const helpValueBenefitAmountIncome = annualIncomeLoc + helpValueBenefitAmount;

            // INCOME TAX

            taxBrackets = [15200, 26830, 46440];
            pitRate = [25, 40, 45, 50];

            incomeTax = calculateIncomeTaxProgres(taxBrackets, pitRate, benefitAmountIncome, benefitAmount, ssc_eep_taxAmount);
            incomeTaxChecked = calculateIncomeTaxProgres(taxBrackets, pitRate, helpValueBenefitAmountIncome, helpValueBenefitAmount, 0);
            incomeTaxVsop = calculateIncomeTaxProgres(taxBrackets, pitRate, vsopBenefitAmountIncome, vsopBenefitAmount, ssc_eep_taxAmountVsop);

            // CAPITAL GAIN

            if( taxPoint === "sale" ){
                gainCapital = Math.max( sharesPriceLoc - exercisePriceLoc, 0 );
            }else{
                gainCapital = Math.max( sharesPriceLoc - valueOfSharesLoc, 0);
            }

            taxAmount = calculatePersentValue(gainCapital, 0);

            taxTipsBody.innerHTML = `
	        <div>Tax rates are for 2023. They may change in the future. </div>
	        <div>Progressive rates are taken into account, but personal deductions and allowances are not. If these were included, the tax bill would be less.</div>
	        <div>Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.</div>
	        <div>Local taxes (0-9%) and tax on stock exchange transactions (0.12-1.32%) are not included.</div>
	        <div>Capital gains are not taxable for private individuals resident in Belgium if selling the shares is not part of their business activity.</div>
	        <div>Tax relief is calculated on the assumption that options are not listed in the stock exchange and their life is up to 5 years.</div>
	        `
            treatmentBody.innerHTML = `
	        <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
              <li>Taxes will be the lowest and a single tax point will be at grant if all following conditions are met:
                  <ul role="list" class="tax-treatment-sublist">
                    <li>options must be accepted in writing within 60 days from the offer to benefit from tax relief</li>
                    <li>the exercise price is determined in the grant offer</li>
                    <li>the risk of the price decline is not covered</li>
                    <li>options are exercised within 3 to 10 years from their grant</li>
                    <li>options are not transferrable</li>
		    <li>the options give right for the shares of the employer or a group company</li>
                  </ul>
	          </li>
	        </ul>`

            break;
        case "italy":
            // TAX POINT

            taxPoint = isTreatmentToggle ? 'exercise+sale' : 'exercise+sale';

            //SOCIAL SECURITY CONTRIBUTIONS

            ssrRate = 10;
            ssrRateE = 32;

            ssc_erp_taxAmount = calculatePersentValue(benefitAmount, ssrRate);
            ssc_erp_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRate);;

            ssc_eep_taxAmount = calculatePersentValue(benefitAmount, ssrRateE);
            ssc_eep_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRateE);

            ssc_tc_taxAmount = ssc_erp_taxAmount + ssc_eep_taxAmount;
            ssc_tc_taxAmountChecked = ssc_tc_taxAmount;
            ssc_tc_taxAmountVsop = ssc_erp_taxAmountVsop + ssc_eep_taxAmountVsop;

            // INCOME TAX

            taxBrackets = [15000, 28000, 50000];
            pitRate = [ 23, 25, 35, 43];

            incomeTax = calculateIncomeTaxProgres(taxBrackets, pitRate, benefitAmountIncome, benefitAmount, 0);
            incomeTaxChecked = incomeTax;
            incomeTaxVsop = calculateIncomeTaxProgres(taxBrackets, pitRate, vsopBenefitAmountIncome, vsopBenefitAmount, 0);

            // CAPITAL GAIN

            if( taxPoint === "sale" ){
                gainCapital = Math.max( sharesPriceLoc - exercisePriceLoc, 0 );
            }else{
                gainCapital = Math.max( sharesPriceLoc - valueOfSharesLoc, 0);
            }

            taxAmount = calculatePersentValue(gainCapital, 26);

            taxTipsBody.innerHTML = `
	        <div>Tax rates are for 2023. They may change in the future. </div>
	        <div>Progressive rates are taken into account, but personal deductions are not. If the personal deductions were included, the tax bill would normally be less, not more.</div>
	        <div>Social security contribution rates are maximum, so depending your case, they may be a little lower.</div>
	        <div>Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.</div>
	        <div>Municipal, regional and financial transaction taxes are not included as their small amount low does not significantly affect the result.</div>
	        `
            treatmentBody.innerHTML = `
	        <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
              <li>Unfortunately, there is no favourable tax treatment available for stock option programs.</li>
              <li>Currently, the income from stock option plans is treated as employment income and is taxable with regular progressive tax rates.</li>
              <li>The only applicable tax benefit is that earnings up to EUR 2065,83 are tax-free if: 
                  <ul role="list" class="tax-treatment-sublist">
                    <li>the shares are not sold back to the issuing company or </li>
                    <li>otherwise not transferred within 3 years from their assignment.</li>
                  </ul>
	          </li>
	          <li>Social security contributions might not be payable on certain cases, for example, if the income exceeds certain ceilings and other exceptions apply.</li>
	        </ul>`

            break;
          case "france":
	      // TAX POINT 
	      
	      taxPoint = isTreatmentToggle ? 'sale' : 'exercise';
	      
	      //SOCIAL SECURITY CONTRIBUTIONS
	      
	      ssrRate = 2.9;
	      ssrRateE = 2.65;
	      
	      ssc_erp_taxAmount = calculateIncomeTaxProgres([351936], [45,25], benefitAmountIncome, benefitAmount, 0);
	      ssc_erp_taxAmountVsop = calculateIncomeTaxProgres([351936], [45,25], vsopBenefitAmountIncome, vsopBenefitAmount, 0);
	
	      ssc_eep_taxAmount = calculateIncomeTaxProgres([351936], [21.15,10.10], benefitAmountIncome, benefitAmount, 0);
	      ssc_eep_taxAmountVsop = calculateIncomeTaxProgres([351936], [21.15,10.10], vsopBenefitAmountIncome, vsopBenefitAmount, 0);
	
	      ssc_tc_taxAmount = ssc_erp_taxAmount + ssc_eep_taxAmount;
	      ssc_tc_taxAmountChecked = 0;
	      ssc_tc_taxAmountVsop = ssc_erp_taxAmountVsop + ssc_eep_taxAmountVsop;
	      
	      // INCOME TAX
	      
	      taxBrackets = [10778, 27479, 78571, 168995];
	      pitRate = [0, 11, 30, 41, 45];
	      
	      incomeTax = calculateIncomeTaxProgres(taxBrackets, pitRate, benefitAmountIncome, benefitAmount, ssc_eep_taxAmount);
	      incomeTaxChecked = 0;
	      incomeTaxVsop = calculateIncomeTaxProgres(taxBrackets, pitRate, vsopBenefitAmountIncome, vsopBenefitAmount, ssc_eep_taxAmountVsop);
	      
	      // CAPITAL GAIN
	      
	      if( taxPoint === "sale" ){
		gainCapital = Math.max( sharesPriceLoc - exercisePriceLoc, 0 );
	      }else{
		gainCapital = Math.max( sharesPriceLoc - valueOfSharesLoc, 0);
	      }
	      
	      taxAmount = calculatePersentValue(gainCapital, 12.8) + calculatePersentValue(gainCapital, 17.2);

	    taxTipsBody.innerHTML = `
		<div>Tax rates are for 2023. They may change in the future. </div>
		<div>Progressive rates are taken into account, but personal deductions and allowances are not. If these were included, the tax bill would be less.</div>
		<div>Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.</div>
		<div>Surtax on high income (above 250 000 eur) is not included.</div>
		<div>Tax relief is calculated assuming the company has employed the beneficiary for 3+ years. If not, the final income tax rate is 30% instead of 12.8%.</div>
		`
	    treatmentBody.innerHTML = `
		<ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
			<li>If BSPCE requirements are met, the employee only pays taxes when the shares are sold.</li>
			<li>Company has to notify the tax authorities about the plan. The company must satisfy following conditions:
			<ul role="list" class="tax-treatment-sublist">
				<li>registered for less than 15 years</li>
				<li>subject to corporation tax in France</li>
    				<li>not listed or have market capitalisation less than 150 million euros,</li>
				<li>more than 25% of its capital is held by natural persons</li>
			</ul>
			</li>
			<li>BSPCE can be given to employees, as well as managers who are taxed as employees.</li>
		</ul>`
	      
	      break;
      case "portugal":
              // TAX POINT 
              
              taxPoint = isTreatmentToggle ? 'sale' : 'exercise+sale';
              
              //SOCIAL SECURITY CONTRIBUTIONS
              
              ssrRate = 23.75;
              ssrRateE = 11;
              
              ssc_erp_taxAmount = 0;
              ssc_erp_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRate);
        
              ssc_eep_taxAmount = 0;
              ssc_eep_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRateE);
        
              ssc_tc_taxAmount = ssc_erp_taxAmount + ssc_eep_taxAmount;
              ssc_tc_taxAmountChecked = ssc_tc_taxAmount;
              ssc_tc_taxAmountVsop = ssc_erp_taxAmountVsop + ssc_eep_taxAmountVsop;
              
              // INCOME TAX
              
              taxBrackets = [7479, 11284, 15992, 20700, 26355, 38632, 50483, 78834];
              pitRate = [14.50, 21.00, 26.50, 28.50, 35.00, 37.00, 43.50, 45.00, 48.00];
              
              incomeTax = calculateIncomeTaxProgres(taxBrackets, pitRate, benefitAmountIncome, benefitAmount, 0);
              incomeTaxChecked = 0;
              incomeTaxVsop = calculateIncomeTaxProgres(taxBrackets, pitRate, vsopBenefitAmountIncome, vsopBenefitAmount, 0);
              
              // CAPITAL GAIN
              
              if( taxPoint === "sale" ){
                gainCapital = Math.max( sharesPriceLoc - exercisePriceLoc, 0 );
              }else{
                gainCapital = Math.max( sharesPriceLoc - valueOfSharesLoc, 0);
              }
              
              taxAmount = calculatePersentValue(gainCapital, 28/2);

              taxTipsBody.innerHTML = `
            		<div>Tax rates are for 2023. They may change in the future. </div>
            		<div>Progressive rates are taken into account, but personal deductions and allowances are not. If these were included, the tax bill would be less.</div>
            		<div>Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.</div>
            		<div>If the person stops being Portuguese tax resident before the shares are sold, the tax point is at the moment when the tax resident status ends (so-called "exit tax").</div>
              `
        	    treatmentBody.innerHTML = `
            		<ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
            			<li>From 2023, a new stock options tax regime is available for start-ups, scale-ups, SMEs and "innovative" companies.</li>
            			<li>Eligible startups and scaleups are defined in the tax law. Main conditions:
            			<ul role="list" class="tax-treatment-sublist">
            				<li>operate <10 years, employs <250 people, annual turnover <50 MEUR</li>
            				<li>has headquarters or permanent establishment or employs at least 25 workers in Portugal</li>
                    <li>is an innovative company with high growth potential, receiving qualifying (e.g. VC) investments or investing in R&D.</li>
            			</ul>
            			</li>
            			<li>Other companies which qualify for Tech Visa may also be eligible.</li>
                  <li>Certification can be obtained from Startup Portugal.</li>
            		</ul>
              `
              
            break;
    case "finland":
	      // TAX POINT 
	      
	      taxPoint = isTreatmentToggle ? 'exercise+sale' : 'grant+sale';
	      
	      //SOCIAL SECURITY CONTRIBUTIONS
	      
	      ssrRate = 20;
	      ssrRateE = 10;
	      
	      ssc_erp_taxAmount = calculatePersentValue(benefitAmount, ssrRate);
	      ssc_erp_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRate);
	
	      ssc_eep_taxAmount = calculatePersentValue(benefitAmount, ssrRateE);
	      ssc_eep_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRateE);
	
	      ssc_tc_taxAmount = ssc_erp_taxAmount + ssc_eep_taxAmount;
	      ssc_tc_taxAmountChecked = ssc_erp_taxAmount;
	      ssc_tc_taxAmountVsop = ssc_erp_taxAmountVsop + ssc_eep_taxAmountVsop;
	      
	      // INCOME TAX
	      
	      taxBrackets = [19900, 29700, 49000, 85800];
	      pitRate = [0, 12.64, 30.25, 34.00, 44.00];
	      
	      incomeTax = calculateIncomeTaxProgres(taxBrackets, pitRate, benefitAmountIncome, benefitAmount, 0);
	      incomeTaxChecked = incomeTax;
	      incomeTaxVsop = calculateIncomeTaxProgres(taxBrackets, pitRate, vsopBenefitAmountIncome, vsopBenefitAmount, 0);
	      
	      // CAPITAL GAIN
	      
	      if( taxPoint === "sale" ){
	        gainCapital = Math.max( sharesPriceLoc - exercisePriceLoc, 0 );
	      }else{
	        gainCapital = Math.max( sharesPriceLoc - valueOfSharesLoc, 0);
	      }
	      
	      taxAmount = gainCapital <= 30000 ? calculatePersentValue(gainCapital, 30) : calculatePersentValue(gainCapital - 9000, 34) + 9000;

	      taxTipsBody.innerHTML = `
		<div>Tax rates are for 2023. They may change in the future. </div>
		<div>Progressive rates are taken into account, but personal deductions and allowances are not. If these were included, the tax bill would be less.</div>
		<div>Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.</div>
		<div>Municipal taxes (4.36%-10.86%), church tax (1%-2.10%) and public broadcasting tax are not included in the calculation.</div>
		<div>Social security contribution amount is average since it depends on personal circumstances or choices.</div>
              `
	      treatmentBody.innerHTML = `
		<ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
			<li>If ESOP corresponds to the Finnish Income Tax Law, the participants pay taxes at exercise (otherwise at grant).</li>
			<li>Main conditions for the ESOP to be eligible for the favourable tax treatment: 
			<ul role="list" class="tax-treatment-sublist">
				<li>exercise price is below the market value</li>
				<li>employment is the basis of the option grant. Board and council members are included. Contractors are not included.</li>
				<li>is an innovative company with high growth potential, receiving qualifying (e.g. VC) investments or investing in R&D.</li>
			</ul>
			</li>
			<li>Tax relief from the employee's (and not the employer's) part of social security contributions is available if:
			<ul role="list" class="tax-treatment-sublist">
				<li>the exercise price is less than 50% of the market value</li>
				<li>options are exercised within one year from the grant.</li>
			</ul>
			</li>
		</ul>
              `
	break;
    case "spain":
	      // TAX POINT 
	      
	      taxPoint = isTreatmentToggle ? 'sale' : 'exercise+sale';
	      
	      //SOCIAL SECURITY CONTRIBUTIONS
	      
	      ssrRate = 30.40;
	      ssrRateE = 6.45;
	      
	      const verifyBenefitAmountIncome = benefitAmount > 12000 ?  benefitAmount - 12000 : 0;
	      
	      ssc_erp_taxAmount = calculatePersentValue(benefitAmountIncome > 25290 && benefitAmountIncome < 53946 ? verifyBenefitAmountIncome : 0, ssrRate);
	      ssc_erp_taxAmountVsop = calculatePersentValue(vsopBenefitAmountIncome > 25290 && vsopBenefitAmountIncome < 53946 ? vsopBenefitAmount : 0, ssrRate);
	
	      ssc_eep_taxAmount = calculatePersentValue(benefitAmountIncome > 25290 && benefitAmountIncome < 53946 ? verifyBenefitAmountIncome : 0, ssrRateE);
	      ssc_eep_taxAmountVsop = calculatePersentValue(vsopBenefitAmountIncome > 25290 && vsopBenefitAmountIncome < 53946 ? vsopBenefitAmount : 0, ssrRateE);
	
	      ssc_tc_taxAmount = ssc_erp_taxAmount + ssc_eep_taxAmount;
	      ssc_tc_taxAmountChecked = 0;
	      ssc_tc_taxAmountVsop = ssc_erp_taxAmountVsop + ssc_eep_taxAmountVsop;
	      
	      // INCOME TAX
	      
	      taxBrackets = [ 12450, 35200, 60000, 300000];
	      pitRate = [ 19, 24, 37, 45, 47 ];
	      
	      incomeTax = calculateIncomeTaxProgres(taxBrackets, pitRate, benefitAmountIncome, verifyBenefitAmountIncome, 0);
	      incomeTaxChecked = 0;
	      incomeTaxVsop = calculateIncomeTaxProgres(taxBrackets, pitRate, vsopBenefitAmountIncome, vsopBenefitAmount, 0);
	      
	      // CAPITAL GAIN
	      
	      if( taxPoint === "sale" ){
	        gainCapital = Math.max( sharesPriceLoc - exercisePriceLoc, 0 );
	      }else{
	        gainCapital = Math.max( sharesPriceLoc - valueOfSharesLoc, 0);
	      }
	      
	      const locGainCapital = gainCapital > 50000 ? gainCapital - 50000 : 0;
	      
	      taxAmount = calculateIncomeTaxProgresSpain([6000, 50000, 200000, 300000], [19, 21, 23, 27, 28], locGainCapital, [1140, 10380, 44880, 71880] )
		    
	      taxTipsBody.innerHTML = `
		<div>Tax rates are for 2023. They may change in the future. </div>
		<div>State progressive rates are taken into account, but autonomous community taxes and personal deductions and allowances are not.</div>
		<div>Social security contributions do not include variable tax rates for occupational accidents.</div>
		<div>Tax-free gain for a startup employee of 50K and other employees of 12K per year are included in the calculation.</div>
		<div>Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.</div>
  		<div>The market value of the shares at the exercise is determined based on the last investment round if independent third parties invested in the startup during the previous year.</div>
              `
	      treatmentBody.innerHTML = `
		<ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
			<li>From 2023, startup employees can postpone taxation until the liquidity event.</li>
			<li>Tax point is the earliest of: (1) sale of options or shares (2) company IPO (3) 10 years passed from grant</li>
			<li> Eligible startup:
			<ul role="list" class="tax-treatment-sublist">
				<li>less than 5 yo, <5 MEUR annual revenues</li>
				<li>office of the company and most of employees in Spain</li>
				<li>standalone entity, not listed in stock exchange, no dividends distributed</li>
    				<li>with an innovative character proved by local agencies.</li>
			</ul>
			</li>
		</ul>
              `
		
      break;
    case "ireland":
	      // TAX POINT 
	      
	      taxPoint = isTreatmentToggle ? 'sale' : 'exercise+sale';
	      
	      //SOCIAL SECURITY CONTRIBUTIONS
	      
	      ssrRate = 11.05;
	      ssrRateE = 8.00;
	      
	      ssc_erp_taxAmount = 0;
	      ssc_erp_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRate);
	
	      ssc_eep_taxAmount = calculatePersentValue(benefitAmount, ssrRateE) + calculatePersentValue(benefitAmount, 4);
	      ssc_eep_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRateE) + calculatePersentValue(vsopBenefitAmount, 4);
	
	      ssc_tc_taxAmount = ssc_erp_taxAmount + ssc_eep_taxAmount;
	      ssc_tc_taxAmountChecked = 0;
	      ssc_tc_taxAmountVsop = ssc_erp_taxAmountVsop + ssc_eep_taxAmountVsop;
	      
	      // INCOME TAX
	      
	      incomeTax = calculatePersentValue(benefitAmount, 40);
	      incomeTaxChecked = 0;
	      incomeTaxVsop = calculateIncomeTaxProgres([40000], [20, 40], vsopBenefitAmountIncome, vsopBenefitAmount, 0);
	      
	      // CAPITAL GAIN
	      
	      if( taxPoint === "sale" ){
	        gainCapital = Math.max( sharesPriceLoc - exercisePriceLoc, 0 );
	      }else{
	        gainCapital = Math.max( sharesPriceLoc - valueOfSharesLoc, 0);
	      }
	      
	      taxAmount = calculatePersentValue(gainCapital, 33);

	      taxTipsBody.innerHTML = `
		<div>Tax rates are for 2023. They may change in the future. </div>
		<div>For equity-sharing plans, income tax and social security contributions are calculated at highest rates. Lower rates can be applied with prior approval from the Irish Revenue.</div>
		<div>Stock options without tax relief here are 'short' unapproved options. It means they do not need approval from the Irish tax authority and should be exercised within 7 years from grant. </div>
		<div>Long (unapproved) options are exercisable for more than 7 years, but they may be taxed already at grant if the exercise price is set lower than the market value of the shares at the moment of grant.</div>
		<div>Tax obligations arising from unapproved plans are the employee's sole responsibility, who must report and pay taxes within 30 days of the exercise.</div>
              `
	      treatmentBody.innerHTML = `
		<ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
			<li>Qualifying companies to grant KEEP (Key employee engagement plan)Eligible startup:
			<ul role="list" class="tax-treatment-sublist">
				<li>SMEs, i.e. employing <250 persons and having annual turnover up to 50 MEUR or balance sheet <43 MEUR. Must not be listed in a stock exchange.</li>
				<li>incorporated in Ireland or, if incorporated in EEA or UK, carrying business through a branch in Ireland.</li>
				<li>standalone entity, not listed in stock exchange, no dividends distributed</li>
    				<li>with an innovative character proved by local agencies.</li>
			</ul>
			</li>
   			<li>Options can be granted to full-time employees or directors if they don't hold more than 15% of the qualifying company.</li>
      			<li>Options are exercised no earlier than one year or later than 10 years from the grant.</li>
			<li>Shares acquired through exercise must be new ordinary shares in the qualifying company.</li>
   			<li>Share options must be granted at the market value of the same class of shares at the grant date.</li>
		</ul>
              `
      
      break;    
    case "slovakia":
	      // TAX POINT 
	      
	      taxPoint = isTreatmentToggle ? 'exercise+sale' : 'exercise+sale';
	      
	      //SOCIAL SECURITY CONTRIBUTIONS
	      
	      ssrRate = 24.4;
	      ssrRateE = 9.4;
	      
	      ssc_erp_taxAmount = calculatePersentValue(benefitAmountIncome, ssrRate) < 23222 ?  alculatePersentValue(benefitAmount, ssrRate) : 0;
	      ssc_erp_taxAmountVsop = calculatePersentValue(vsopBenefitAmountIncome, ssrRate) < 23222 ?  alculatePersentValue(vsopBenefitAmount, ssrRate) : 0;
	      
	      const ssc_erp_taxAmountExtra = calculatePersentValue(benefitAmount, 10);
	      const ssc_erp_taxAmountVsopExtra = calculatePersentValue(vsopBenefitAmount, 10);
	
	      ssc_eep_taxAmount = calculatePersentValue(benefitAmountIncome, ssrRateE) < 9000 ?  alculatePersentValue(benefitAmount, ssrRateE) : 0;
	      ssc_eep_taxAmountVsop = calculatePersentValue(vsopBenefitAmountIncome, ssrRateE) < 9000 ?  alculatePersentValue(vsopBenefitAmount, ssrRateE) : 0;
	      
	      const ssc_eep_taxAmountExtra = calculatePersentValue(benefitAmount, 4)
	      const ssc_eep_taxAmountVsopExtra = calculatePersentValue(vsopBenefitAmount, 4)
	
	      ssc_tc_taxAmount = ssc_erp_taxAmount + ssc_eep_taxAmount + ssc_erp_taxAmountExtra + ssc_eep_taxAmountExtra;
	      ssc_tc_taxAmountChecked = ssc_tc_taxAmount;
	      ssc_tc_taxAmountVsop = ssc_erp_taxAmountVsop + ssc_eep_taxAmountVsop + ssc_erp_taxAmountVsopExtra + ssc_eep_taxAmountVsopExtra;
	      
	      // INCOME TAX
	      
	      incomeTax = calculateIncomeTaxProgres([38553], [19, 25], benefitAmountIncome, benefitAmount, 0);
	      incomeTaxChecked = incomeTax;
	      incomeTaxVsop = calculateIncomeTaxProgres([38553], [19, 25], vsopBenefitAmountIncome, vsopBenefitAmount, 0);
	      
	      // CAPITAL GAIN
	      
	      if( taxPoint === "sale" ){
	        gainCapital = Math.max( sharesPriceLoc - exercisePriceLoc, 0 );
	      }else{
	        gainCapital = Math.max( sharesPriceLoc - valueOfSharesLoc, 0);
	      }
	      
	      taxAmount = calculatePersentValue(gainCapital, 25) + calculatePersentValue(gainCapital, 4);

	      taxTipsBody.innerHTML = `
		<div>Tax rates are for 2023. They may change in the future. </div>
		<div>Progressive rates are taken into account, but personal deductions and allowances are not. If these were included, the tax bill would be less.</div>
		<div>Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.</div>
		<div>Income tax, social security contributions and health insurance are included in the calculation. Other smaller amounts of different social security payments are not included.</div>
		<div>Tax rate on capital gains is 25%.</div>
              `
	      treatmentBody.innerHTML = `
		<ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
			<li>Unfortunately, there is no favourable tax treatment available for stock option programs.</li>
   			<li>When options are exercised, the benefit in kind received in shares is taxed as a salary.</li>
      			<li>The employer has the reporting and withholding obligations.</li>
			<li>Sale of listed shares is tax free if the shares are held for at least 1 year.</li>
   			<li>Exit tax might be applicable for persons who stop being tax residents of Slovakia.</li>
		</ul>
              `
      
      break;
    case "sweden":
	      // TAX POINT 
	      
	      taxPoint = isTreatmentToggle ? 'sale' : 'exercise+sale';
	      
	      //SOCIAL SECURITY CONTRIBUTIONS
	      
	      ssrRate = 31.42;
	      ssrRateE = 0;
	      
	      ssc_erp_taxAmount = calculatePersentValue(benefitAmount, ssrRate);
	      ssc_erp_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRate);
	
	      ssc_eep_taxAmount = calculatePersentValue(benefitAmount, ssrRateE);
	      ssc_eep_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRateE);
	
	      ssc_tc_taxAmount = ssc_erp_taxAmount + ssc_eep_taxAmount;
	      ssc_tc_taxAmountChecked = 0;
	      ssc_tc_taxAmountVsop = ssc_erp_taxAmountVsop + ssc_eep_taxAmountVsop;
	      
	      // INCOME TAX
	      
	      incomeTax = calculateIncomeTaxProgres([614000], [32, 52], benefitAmountIncome, benefitAmount, 0);
	      incomeTaxChecked = 0;
	      incomeTaxVsop = calculateIncomeTaxProgres([614000], [32, 52], vsopBenefitAmountIncome, vsopBenefitAmount, 0);
	      
	      // CAPITAL GAIN
	      
	      if( taxPoint === "sale" ){
	        gainCapital = Math.max( sharesPriceLoc - exercisePriceLoc, 0 );
	      }else{
	        gainCapital = Math.max( sharesPriceLoc - valueOfSharesLoc, 0);
	      }
	      
	      taxAmount = calculatePersentValue(gainCapital, 30);

	      taxTipsBody.innerHTML = `
		<div>Tax rates are for 2023. They may change in the future. </div>
		<div>Progressive rates are taken into account, but personal deductions and allowances are not. If these were included, the tax bill would be less.</div>
		<div>Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.</div>
		<div>Income tax, social security contributions and health insurance are included in the calculation. Other smaller amounts of different social security payments are not included.</div>
		<div>Tax rate on capital gains is 25%.</div>
              `
	      treatmentBody.innerHTML = `
		<ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
			<li>QESO (kvalificerade personaloptioner) must meet several conditions regarding issuing company, options and recipients.</li>
   			<li>Company is a Swedish 'aktiebolag' or similar foreign company carrying business in Sweden and less than 10 years old.</li>
      			<li>Company has less than 250 employees and less than SEK 280 million revenue in the year preceding to issuing options. </li>
			<li>Certain sectors like banking, immovable property, legal and accounting services etc are excluded.</li>
   			<li>Employees and board members are eligible if they have been employed full-time for at least 3 years.</li>
      			<li>Total amount of options cannot exceed SEK 75 million and SEK 3 million per employee.</li>
			<li>Options are exercised no earlier than 3 years or later than 10 years from the grant.</li>
		</ul>
              `
      
      break;

    case "slovenia":
	      // TAX POINT 
	      
	      taxPoint = isTreatmentToggle ? 'exercise+sale' : 'exercise+sale';
	      
	      //SOCIAL SECURITY CONTRIBUTIONS
	      
	      ssrRate = 16.10;
	      ssrRateE = 22.10;
	      
	      ssc_erp_taxAmount = calculatePersentValue(benefitAmount, ssrRate);
	      ssc_erp_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRate);
	
	      ssc_eep_taxAmount = calculatePersentValue(benefitAmount, ssrRateE);
	      ssc_eep_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRateE);
	
	      ssc_tc_taxAmount = ssc_erp_taxAmount + ssc_eep_taxAmount;
	      ssc_tc_taxAmountChecked = ssc_tc_taxAmount;
	      ssc_tc_taxAmountVsop = ssc_erp_taxAmountVsop + ssc_eep_taxAmountVsop;
	      
	      // INCOME TAX
	      
	      incomeTax = calculateIncomeTaxProgres([8755, 25750, 51500, 74160], [16, 26, 33, 39, 50], benefitAmountIncome, benefitAmount, 0);
	      incomeTaxChecked = incomeTax;
	      incomeTaxVsop = calculateIncomeTaxProgres([8755, 25750, 51500, 74160], [16, 26, 33, 39, 50], vsopBenefitAmountIncome, vsopBenefitAmount, 0);
	      
	      // CAPITAL GAIN
	      
	      if( taxPoint === "sale" ){
	        gainCapital = Math.max( sharesPriceLoc - exercisePriceLoc, 0 );
	      }else{
	        gainCapital = Math.max( sharesPriceLoc - valueOfSharesLoc, 0);
	      }
	      
	      taxAmount = calculatePersentValue(gainCapital, 25);

	      taxTipsBody.innerHTML = `
		<div>Tax rates are for 2023. They may change in the future. </div>
		<div>Progressive rates are taken into account, but personal deductions and allowances are not. If these were included, the tax bill would be less.</div>
		<div>Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.</div>
		<div>Tax rate for capital gains is 25%, although it can be lower depending on the holding time of the assets.</div>
              `
	      treatmentBody.innerHTML = `
		<ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
			<li>Unfortunately, there is no favourable tax treatment available for stock option programs.</li>
			<li>Tax on the sale of shares can be lower if the shares are held for longer than 5 years.</li>
		</ul>
              `
      
      break;
    case "luxembourg":
	      // TAX POINT 
	      
	      taxPoint = isTreatmentToggle ? 'grant/exercise' : 'grant/exercise';
	      
	      //SOCIAL SECURITY CONTRIBUTIONS
	      
	      ssrRate = 14.92;
	      ssrRateE = 12.45;
	      
	      ssc_erp_taxAmount = benefitAmountIncome < 146824 ?  calculatePersentValue(benefitAmount, ssrRate) : 0;
	      ssc_erp_taxAmountVsop = vsopBenefitAmountIncome < 146824 ?  calculatePersentValue(vsopBenefitAmount, ssrRate) : 0;
	
	      ssc_eep_taxAmount = benefitAmountIncome < 146824 ?  calculatePersentValue(benefitAmount, ssrRateE) : 0;
	      ssc_eep_taxAmountVsop = vsopBenefitAmountIncome < 146824 ? calculatePersentValue(vsopBenefitAmount, ssrRateE) : 0;
	
	      ssc_tc_taxAmount = ssc_erp_taxAmount + ssc_eep_taxAmount;
	      ssc_tc_taxAmountChecked = ssc_tc_taxAmount;
	      ssc_tc_taxAmountVsop = ssc_erp_taxAmountVsop + ssc_eep_taxAmountVsop;
	      
	      // INCOME TAX
	      incomeTax = calculateIncomeTaxProgres([20000, 40000, 60000, 80000, 100000, 120000, 140000, 150000, 200000], [0, 12.91, 22.69, 27.83, 30.61, 32.64, 34.09, 34.67, 37.18, 45.78], benefitAmountIncome, benefitAmount, 0);
	      
	      incomeTaxChecked = incomeTax;
	      incomeTaxVsop = calculateIncomeTaxProgres([20000, 40000, 60000, 80000, 100000, 120000, 140000, 150000, 200000], [0, 12.91, 22.69, 27.83, 30.61, 32.64, 34.09, 34.67, 37.18, 45.78], vsopBenefitAmountIncome, vsopBenefitAmount, 0);
	      
	      // CAPITAL GAIN
	      
	      if( taxPoint === "sale" ){
	        gainCapital = Math.max( sharesPriceLoc - exercisePriceLoc, 0 );
	      }else{
	        gainCapital = Math.max( sharesPriceLoc - valueOfSharesLoc, 0);
	      }
	      
	      taxAmount = calculatePersentValue(gainCapital, 0);

	      taxTipsBody.innerHTML = `
		<div>Tax rates are for 2023. They may change in the future. </div>
		<div>Average progressive rates and solidarity surcharge for Class 1 (single taxpayer) are the basis of the income tax calculation.</div>
		<div>The upper limit of social security contributions is used (12.45% employee's, 14.92% employer's part). Contributions are capped at EUR146 824.</div>
		<div>Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.</div>
  		<div>For capital gains taxation, we assume the shareholding is below 10% and the shares are held for more than six months. If not, the tax is levied at progressive rates, although reliefs are available on certain conditions. </div>
              `
	      treatmentBody.innerHTML = `
		<ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
			<li>Since 2021 the favourable tax treatment for stock options and warrants was abolished.</li>
			<li>Tradable or transferable stock options are taxable at grant. </li>
   			<li>Non-tradable and non-transferable stock options are taxable at exercise.</li>
		</ul>
              `
      
      break;
        default:

            break;
    }
}

//toggle
const taxToggler = document.getElementById("tax-toggler");
const taxTogglerUk = document.getElementById("tax-toggler-uk");

//checkbox
const csopCheckboxUk = document.getElementById("csop-checkbox-uk");
const vsopCheckboxUk = document.getElementById("vsop-checkbox-uk");
const emiCheckboxUk = document.getElementById("emi-checkbox-uk");

// Get the div element
const exercisePrice = document.getElementById("exercise-price-field__wrapper");
const valueOfShares = document.getElementById("value-of-shares-field__wrapper");
const valueOfSharesGrant = document.getElementById("value-of-shares-grant__wrapper");
const sharesPrice = document.getElementById("shares-price-field__wrapper");
const annualIncome = document.getElementById("annual-income-field__wrapper");

convertDivToLabel( exercisePrice );
convertDivToLabel( valueOfShares );
convertDivToLabel( valueOfSharesGrant );
convertDivToLabel( sharesPrice );
convertDivToLabel( annualIncome );

//get fields
const taxCountryField = document.getElementById('tax-country-field');
const exercisePriceField = document.getElementById('exercise-price-field');
const valueOfSharesField = document.getElementById('value-of-shares-field');
const valueOfSharesGrantField = document.getElementById('value-of-shares-grant-field');
const sharesPriceField = document.getElementById('shares-price-field');
const annualIncomeField = document.getElementById("annual-income-field");
const currencyElements = document.getElementsByClassName('is--currency');

const treatmentToggle = document.getElementById('treatment-toggle');

//get outputs
const yourCostOut = document.getElementById('your-cost-out');
const totalTaxesOut = document.getElementById('total-taxes-out');
const yourGainOut = document.getElementById('your-gain-out');
const yourGainOutExtra = document.getElementById('your-gain-out-extra');
const totalTaxesOutVsop = document.getElementById('total-taxes-out__vsop');
const yourGainOutVsop = document.getElementById('your-gain-out__vsop');

const yourCostBar = document.getElementById('your-cost-bar');
const totalTaxesBar = document.getElementById('total-taxes-bar');
const yourGainBar = document.getElementById('your-gain-bar');
const yourGainBarExtra = document.getElementById('your-gain-bar-extra');

const totalTaxesBarVsop = document.getElementById('total-taxes-bar__vsop');
const yourGainBarVsop = document.getElementById('your-gain-bar__vsop');
const yourGainBarVsopExtra = document.getElementById('your-gain-bar__vsop-extra');

const outBenefit = document.getElementById('out-benefit');
const outCapitalGain = document.getElementById('out-capital-gain');
const outTaxPoint = document.getElementById('out-tax-point');
const outIncomeTaxes = document.getElementById('out-income-taxes');
const outSocialSecurity = document.getElementById('out-social-security');
const outSocialSecurityEmployer = document.getElementById('out-social-security-employer');
const outCapitalGains = document.getElementById('out-capital-gains');

const outVsopPayment = document.getElementById('out-vsop-payment');
const outVsopTaxPoint = document.getElementById('out-vsop-tax-point');
const outVsopIncomeTaxes = document.getElementById('out-vsop-income-taxes');
const outVsopSocialSecurity = document.getElementById('out-vsop-social-security');
const outVsopSocialSecurityExtra = document.getElementById('out-vsop-social-security-extra');

//text
const infoBubble1 = document.getElementById('info-bubble-1');
const infoBubble2 = document.getElementById('info-bubble-2');
const infoBubble3 = document.getElementById('info-bubble-3');
const infoBubble4 = document.getElementById('info-bubble-4');
const taxReliefBubble = document.getElementById('tax-relief-bubble');

// more buttons
const moreButtonExercisePrice = document.getElementById('exercise-price-more-button');
const moreButtonValueOfShares = document.getElementById('value-of-shares-more-button');
const moreButtonSalePrice = document.getElementById('sale-price-more-button');
const moreButtonAnnualIncome = document.getElementById('annual-income-more-button');

//tips and treatment
const taxTipsBody = document.getElementById('tax-tips-body');
const treatmentBody = document.getElementById('treatment-body');

exercisePriceField.addEventListener('input', (event) => {
    formatInputWithCommasWithZero(event.target);
});

valueOfSharesField.addEventListener('input', (event) => {
    formatInputWithCommasWithZero(event.target);
});

valueOfSharesGrantField.addEventListener('input', (event) => {
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
        case "Croatia":
        case "Greece":
        case "Belgium":
        case "Italy":
    	case "France":
    	case "Spain":
    	case "Finland":
    	case "Portugal":
    	case "Ireland":
	case "Slovakia":
    	case "Slovenia":
    	case "Luxembourg":
        case "Netherlands":
            value = "EUR";
            break;
    	case "Sweden":
            value = "SEK";
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
        case "United Kingdom":
            value = "GBP";
            break;
        case "Bulgaria":
            value = "BGN";
            break;
        case "Hungary":
            value = "HUF";
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
let exercisePriceLoc = 10;
let valueOfSharesLoc = 500;
let valueOfSharesGrantLoc = 300;
let sharesPriceLoc = 10000;
let annualIncomeLoc = 100000;
let isTreatmentToggle = treatmentToggle.checked;

let selectedCountry = taxCountryField.value;

let benefitAmount = valueOfSharesLoc - exercisePriceLoc > 0 ? valueOfSharesLoc - exercisePriceLoc : 0;
let benefitAmountIncome = annualIncomeLoc + benefitAmount;

let vsopBenefitAmount = sharesPriceLoc;
let vsopBenefitAmountIncome = annualIncomeLoc + vsopBenefitAmount;

let ssc_erp_taxAmount;
let ssc_erp_taxAmountVsop;

let ssc_eep_taxAmount;
let ssc_eep_taxAmountVsop;

let ssc_tc_taxAmount;
let ssc_tc_taxAmountChecked;
let ssc_tc_taxAmountVsop;

let incomeTax;
let incomeTaxChecked;
let incomeTaxVsop;

let taxPoint;
let gainCapital;
let taxAmount;

let valIncomeTaxes = isTreatmentToggle ? incomeTaxChecked : incomeTax;
let valSocialSecurity = isTreatmentToggle ? ssc_tc_taxAmountChecked : ssc_tc_taxAmount;
let valCapitalGains = taxAmount;
let valTotalTaxes = valIncomeTaxes + valSocialSecurity + valCapitalGains;

let valPaymentFromVsop = sharesPriceLoc;
let valVsopIncomeTaxes = incomeTaxVsop;
let valVsopSocialSecurity = ssc_tc_taxAmountVsop;

calculateTax();

function updateData() {

    if ( taxCountryField.value === "belgium" ){
        document.getElementById('value-of-shares-grant-group').style.display = 'flex'
    }else{
        document.getElementById('value-of-shares-grant-group').style.display = 'none'
    }
    //show loader
    showTaxLoaderAndResults();
    blockLoading = true;

    //set default values

    if ( taxCountryLoc !== setCountryCur(taxCountryField.options[taxCountryField.selectedIndex].text) ){
        taxCountryLoc = setCountryCur(taxCountryField.options[taxCountryField.selectedIndex].text);
        replaceTextAll(taxCountryLoc);
    }

    exercisePriceLoc = exercisePriceField.value === '' ? 12 : removeCommas(exercisePriceField.value);
    valueOfSharesLoc = valueOfSharesField.value === '' ? 500 : removeCommas(valueOfSharesField.value);
    valueOfSharesGrantLoc = valueOfSharesGrantField.value === '' ? 300 : removeCommas(valueOfSharesGrantField.value);
    sharesPriceLoc = sharesPriceField.value === '' ? 10000 : removeCommas(sharesPriceField.value);
    annualIncomeLoc = annualIncomeField.value === '' ? 100000 : removeCommas(annualIncomeField.value);

    isTreatmentToggle = treatmentToggle.checked;
    selectedCountry = taxCountryField.value;

    benefitAmount = valueOfSharesLoc - exercisePriceLoc > 0 ? valueOfSharesLoc - exercisePriceLoc : 0;
    benefitAmountIncome = annualIncomeLoc + benefitAmount;

    vsopBenefitAmount = sharesPriceLoc;
    vsopBenefitAmountIncome = annualIncomeLoc + vsopBenefitAmount;

    calculateTax();

    valIncomeTaxes = isTreatmentToggle ? incomeTaxChecked : incomeTax;
    valSocialSecurity = isTreatmentToggle ? ssc_eep_taxAmountChecked : ssc_eep_taxAmount;
    valSocialSecurityEmployer = isTreatmentToggle ? ssc_erp_taxAmountChecked : ssc_erp_taxAmount;
    valCapitalGains = taxAmount;
    valTotalTaxes = valIncomeTaxes + valSocialSecurity + valCapitalGains;

    outBenefit.textContent = formatOut(valueOfSharesLoc - exercisePriceLoc > 0 ? valueOfSharesLoc - exercisePriceLoc : 0);
    outCapitalGain.textContent = formatOut(gainCapital);
    outTaxPoint.textContent = taxPoint;
    outIncomeTaxes.textContent = formatOut(valIncomeTaxes)
    outSocialSecurity.textContent = formatOut(valSocialSecurity)
    outSocialSecurityEmployer.textContent = formatOut(valSocialSecurityEmployer)
    outCapitalGains.textContent = formatOut(valCapitalGains)

    valPaymentFromVsop = sharesPriceLoc;
    valVsopIncomeTaxes = incomeTaxVsop + ssc_eep_taxAmountVsop;
    valVsopSocialSecurity = ssc_tc_taxAmountVsop;

    outVsopPayment.textContent = formatOut(valPaymentFromVsop)
    outVsopTaxPoint.textContent = "Payment";
    outVsopIncomeTaxes.textContent = formatOut(incomeTaxVsop);
    outVsopSocialSecurity.textContent = formatOut(ssc_eep_taxAmountVsop);
    outVsopSocialSecurityExtra.textContent = formatOut(ssc_erp_taxAmountVsop);

    yourCostOut.textContent = formatOut(exercisePriceLoc);
    totalTaxesOut.textContent = formatOut(valTotalTaxes + ssc_erp_taxAmountVsop);
    yourGainOut.textContent = formatOut(sharesPriceLoc - ( valTotalTaxes + ssc_erp_taxAmountVsop );
    yourGainOutExtra.textContent = formatOut(sharesPriceLoc - ( valTotalTaxes + ssc_erp_taxAmountVsop ) - ssc_eep_taxAmountVsop);

    totalTaxesOutVsop.textContent = formatOut ( incomeTaxVsop + ssc_erp_taxAmountVsop );
    yourGainOutVsop.textContent = formatOut ( sharesPriceLoc - ( incomeTaxVsop + ssc_erp_taxAmountVsop ) );

    yourCostBar.style.height = Math.ceil( ( exercisePriceLoc / sharesPriceLoc ) * 100) + "%";
    totalTaxesBar.style.height = Math.ceil( ( valTotalTaxes / sharesPriceLoc ) * 100) + "%";
    yourGainBar.style.height = Math.ceil( ( ( sharesPriceLoc - valTotalTaxes - exercisePriceLoc ) / sharesPriceLoc ) * 100) + "%";
    yourGainBarExtra.style.height = Math.ceil( ( ( sharesPriceLoc - valTotalTaxes - exercisePriceLoc - valSocialSecurityEmployer ) / sharesPriceLoc ) * 100) + "%";
    totalTaxesBarVsop.style.height = Math.ceil( ( ( incomeTaxVsop + ssc_tc_taxAmountVsop ) / sharesPriceLoc ) * 100) + "%";
    yourGainBarVsop.style.height = Math.ceil( ( ( sharesPriceLoc - ( incomeTaxVsop + ssc_erp_taxAmountVsop ) ) / sharesPriceLoc ) * 100) + "%";
    yourGainBarVsopExtra.style.height = Math.ceil( ( ( sharesPriceLoc - ssc_eep_taxAmountVsop - ( incomeTaxVsop + ssc_erp_taxAmountVsop ) ) / sharesPriceLoc ) * 100) + "%";
}

taxCountryField.onchange = () => {
    updateData();
};

treatmentToggle.addEventListener('change', function () {
    blockLoading = false;
    updateData();
    if ( treatmentToggle.checked ){
        console.log('checked')
        console.log(document.getElementById('tax-checkbox_toggle-true'))
        document.getElementById('tax-checkbox_toggle-true').click();
    }else{
        console.log('unchecked')
        document.getElementById('tax-checkbox_toggle-false').click();
    }
});
csopCheckboxUk.addEventListener('change', function () {
    blockLoading = false;
    setTimeout(updateData, 500)
});
vsopCheckboxUk.addEventListener('change', function () {
    blockLoading = false;
    setTimeout(updateData, 500)
});
emiCheckboxUk.addEventListener('change', function () {
    blockLoading = false;
    setTimeout(updateData, 500)
});

taxCountryField.addEventListener('input', updateData);
exercisePriceField.addEventListener('input', updateData);
valueOfSharesField.addEventListener('input', updateData);
sharesPriceField.addEventListener('input', updateData);
annualIncomeField.addEventListener('input', updateData);

$('.tax-calc-email-form').submit(()=>{
    loadingAllow = true;
    $('.trigger__show-tax-calc').click();
    document.getElementById('results_wrapper').style.display = 'flex';
    document.getElementById('tax-calc-email-form').style.display = 'none';
    updateData();
    showTaxLoaderAndResults();
    setTimeout(() => {
        $('.navigato-to-res').click();
    }, 100);
});

updateData();

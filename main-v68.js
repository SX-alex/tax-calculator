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

function formatOut(number) {
    // Round the number using Math.round
    const roundedNumber = Math.round(number);

    // Convert the number to a string
    let formattedNumber = roundedNumber.toString();

    // Add commas every three digits from the end
    const numberOfCommas = Math.floor((formattedNumber.length - 1) / 3);
    for (let i = 1; i <= numberOfCommas; i++) {
        const commaIndex = formattedNumber.length - i * 3;
        formattedNumber = formattedNumber.slice(0, commaIndex) + ',' + formattedNumber.slice(commaIndex);
    }

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
            incomeTaxChecked = calculateIncomeTaxProgres(taxBrackets, pitRate, benefitAmountIncome + benefitAmount - 3000, benefitAmount - 3000, ssc_eep_taxAmount);
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

            ssrRate = 20;
            ssrRateE = 20;

            ssc_erp_taxAmount = calculatePersentValue(benefitAmount, ssrRate);
            ssc_erp_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRate);;

            ssc_eep_taxAmount = calculatePersentValue(benefitAmount, ssrRateE);
            ssc_eep_taxAmountVsop = calculatePersentValue(vsopBenefitAmount, ssrRateE);

            ssc_tc_taxAmount = ssc_erp_taxAmount + ssc_eep_taxAmount;
            ssc_tc_taxAmountChecked = ssc_tc_taxAmount;
            ssc_tc_taxAmountVsop = ssc_erp_taxAmountVsop + ssc_eep_taxAmountVsop;

            // INCOME TAX

            const baiHelp_op1 = ( benefitAmountIncome - 10908 ) / 10000;
            const baiHelp_op2 = ( benefitAmountIncome - 15999 ) / 10000;

            const baHelp_op1 = ( 979.18 * baiHelp_op1 + 1400 ) * baiHelp_op1;
            const baHelp_op2 = ( 192.59 * baiHelp_op2 + 2397 ) * baiHelp_op2 + 966.53;

            const vsopBaiHelp_op1 = ( vsopBenefitAmountIncome - 10908 ) / 10000;
            const vsopBaiHelp_op2 = ( vsopBenefitAmountIncome - 15999 ) / 10000;

            const vsopBaHelp_op1 = ( 979.18 * vsopBaiHelp_op1 + 1400 ) * vsopBaiHelp_op1;
            const vsopBaHelp_op2 = ( 192.59 * vsopBaiHelp_op2 + 2397 ) * vsopBaiHelp_op2 + 966.53;

            taxBrackets = [10908, 15999, 62809, 277825];
            pitRate = [0, baHelp_op1 / ( benefitAmountIncome - 10908 ) * 100, baHelp_op2 / ( benefitAmountIncome - 10908 ) * 100 , 42, 45];
            const pitRateHelp = [0, vsopBaHelp_op1 / vsopBenefitAmountIncome * 100, vsopBaHelp_op2 / vsopBenefitAmountIncome * 100 , 42, 45];

            incomeTax = calculateIncomeTaxProgres(taxBrackets, pitRate, benefitAmountIncome, benefitAmount, 0);
            incomeTaxChecked = 0;
            incomeTaxVsop = calculateIncomeTaxProgres(taxBrackets, pitRateHelp, vsopBenefitAmountIncome, vsopBenefitAmount, 0);

            // CAPITAL GAIN

            if( taxPoint === "sale" ){
                gainCapital = Math.max( sharesPriceLoc - exercisePriceLoc, 0 );
            }else{
                gainCapital = Math.max( sharesPriceLoc - valueOfSharesLoc, 0);
            }

            taxAmount = calculatePersentValue(gainCapital, 25);

            // TEXT IN BUBBLE

            // moreButtonExercisePrice.style.display = 'inline';
            // moreButtonValueOfShares.style.display = 'inline';
            // moreButtonSalePrice.style.display = 'inline';
            // moreButtonAnnualIncome.style.display = 'inline';

            taxTipsBody.innerHTML = `
      <div>Tax rates are for 2023. They may change in the future.</div>
      <div>Progressive rates are taken into account, but personal deductions are not. If the personal deductions were included, the tax bill would normally be less, not more.</div>
      <div>Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.</div>
      <div>Social security contribution amount is average since it depends on personal circumstances or choices. Church tax and solidarity surcharge are not included.</div>
      `
            treatmentBody.innerHTML = `
      <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
	      <li>Favourable tax rules are available for start-ups and small companies which:
		      <ul role="list" class="tax-treatment-sublist">
		      	<li>employ less than 250 employees</li>
		       	<li>annual turnover is less than 50 MEUR and balance sheet maximum of 43 MEUR</li>
		 	<li>less than 12 years old at the time of employee participation</li>
		      </ul>
	      </li>
       	      <li>Income tax on the share options of such companies can be deferred from exercise to the earliest of one of the following events:
		      <ul role="list" class="tax-treatment-sublist">
		      	<li>sale or transfer of shares</li>
		       	<li>termination of employment agreement, or</li>
		 	<li>12 years passed from exercise</li>
		      </ul>
	      </li>
      </ul>`

            break;
        case "latvia":
            //TOGGLE
            taxToggler.style.display = "grid"
            taxTogglerUk.style.display = "none"

            // TAX POINT

            taxPoint = isTreatmentToggle ? 'sale' : 'exercise';

            //SOCIAL SECURITY CONTRIBUTIONS

            ssrRate = 23.59;
            ssrRateE = 10.5;

            ssc_erp_taxAmount = benefitAmountIncome < 78101 ? calculatePersentValue(benefitAmount, ssrRate) : 0;
            ssc_erp_taxAmountVsop = vsopBenefitAmountIncome < 78101 ? calculatePersentValue(vsopBenefitAmount, ssrRate) : 0;

            ssc_eep_taxAmount = benefitAmountIncome < 78101 ? calculatePersentValue(benefitAmount, ssrRateE) : 0;
            ssc_eep_taxAmountVsop = vsopBenefitAmountIncome < 78101 ? calculatePersentValue(vsopBenefitAmount, ssrRateE) : 0;

            ssc_tc_taxAmount = ssc_erp_taxAmount + ssc_eep_taxAmount;
            ssc_tc_taxAmountChecked = 0;
            ssc_tc_taxAmountVsop = ssc_erp_taxAmountVsop + ssc_eep_taxAmountVsop;

            // INCOME TAX

            taxBrackets = [20004, 78100 ];
            pitRate = [ 20, 23, 30 ];

            incomeTax = calculateIncomeTaxProgres(taxBrackets, pitRate, benefitAmountIncome, benefitAmount, 0);
            incomeTaxChecked = 0;
            incomeTaxVsop = calculateIncomeTaxProgres(taxBrackets, pitRate, vsopBenefitAmountIncome, vsopBenefitAmount, 0);

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
            // moreButtonSalePrice.style.display = 'inline';
            // moreButtonAnnualIncome.style.display = 'none';

            taxTipsBody.innerHTML = `
      <div>Tax rates are for 2023. They may change in the future.</div>
      <div>Progressive rates are taken into account, but personal deductions are not. If the personal deductions were included, the tax bill would normally be less, not more.</div>
      <div>Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.</div>
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

const outBenefit = document.getElementById('out-benefit');
const outCapitalGain = document.getElementById('out-capital-gain');
const outTaxPoint = document.getElementById('out-tax-point');
const outIncomeTaxes = document.getElementById('out-income-taxes');
const outSocialSecurity = document.getElementById('out-social-security');
const outCapitalGains = document.getElementById('out-capital-gains');

const outVsopPayment = document.getElementById('out-vsop-payment');
const outVsopTaxPoint = document.getElementById('out-vsop-tax-point');
const outVsopIncomeTaxes = document.getElementById('out-vsop-income-taxes');
const outVsopSocialSecurity = document.getElementById('out-vsop-social-security');

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
    	case "United Kingdom":
		    console.log('uk')
	    value = "GBP";
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
    valSocialSecurity = isTreatmentToggle ? ssc_tc_taxAmountChecked : ssc_tc_taxAmount;
    valCapitalGains = taxAmount;
    valTotalTaxes = valIncomeTaxes + valSocialSecurity + valCapitalGains;

    outBenefit.textContent = formatOut(valueOfSharesLoc - exercisePriceLoc > 0 ? valueOfSharesLoc - exercisePriceLoc : 0);
    outCapitalGain.textContent = formatOut(gainCapital);
    outTaxPoint.textContent = taxPoint;
    outIncomeTaxes.textContent = formatOut(valIncomeTaxes)
    outSocialSecurity.textContent = formatOut(valSocialSecurity)
    outCapitalGains.textContent = formatOut(valCapitalGains)

    valPaymentFromVsop = sharesPriceLoc;
    valVsopIncomeTaxes = incomeTaxVsop;
    valVsopSocialSecurity = ssc_tc_taxAmountVsop;

    outVsopPayment.textContent = formatOut(valPaymentFromVsop)
    outVsopTaxPoint.textContent = "Payment";
    outVsopIncomeTaxes.textContent = formatOut(incomeTaxVsop);
    outVsopSocialSecurity.textContent = formatOut(ssc_tc_taxAmountVsop);

    yourCostOut.textContent = formatOut(exercisePriceLoc);
    totalTaxesOut.textContent = formatOut(valTotalTaxes);
    yourGainOut.textContent = formatOut(sharesPriceLoc - valTotalTaxes - exercisePriceLoc);

    totalTaxesOutVsop.textContent = formatOut ( incomeTaxVsop + ssc_tc_taxAmountVsop );
    yourGainOutVsop.textContent = formatOut ( sharesPriceLoc - ( incomeTaxVsop + ssc_tc_taxAmountVsop ) );

    yourCostBar.style.height = Math.ceil( ( exercisePriceLoc / sharesPriceLoc ) * 100) + "%";
    totalTaxesBar.style.height = Math.ceil( ( valTotalTaxes / sharesPriceLoc ) * 100) + "%";
    yourGainBar.style.height = Math.ceil( ( ( sharesPriceLoc - valTotalTaxes - exercisePriceLoc ) / sharesPriceLoc ) * 100) + "%";
    totalTaxesBarVsop.style.height = Math.ceil( ( ( incomeTaxVsop + ssc_tc_taxAmountVsop ) / sharesPriceLoc ) * 100) + "%";
    yourGainBarVsop.style.height = Math.ceil( ( ( sharesPriceLoc - ( incomeTaxVsop + ssc_tc_taxAmountVsop ) ) / sharesPriceLoc ) * 100) + "%";

}

taxCountryField.onchange = () => {
    updateData();
};

treatmentToggle.addEventListener('change', function () {
    blockLoading = false;
    updateData();
    if ( treatmentToggle.checked ){
	    document.getElementById('tax-checkbox_toggle-true').click();
    }else{
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

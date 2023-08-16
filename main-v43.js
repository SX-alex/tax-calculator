
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

      infoBubble1.textContent = `Progressive rates are taken into account, but personal deductions are not. If the personal deductions were included, the tax bill would normally be less, not more.`
      infoBubble2.textContent = `Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.`
      infoBubble3.textContent = `Social security contribution amount is average since they depend on personal circumstances or choices.`
      infoBubble4.textContent = `No special favourable treatment for stock options is available. Phantom or virtual share plans (VSOP) may sometimes achieve better tax results since income is taxed when payment is received instead of taxation of estimated value of shares at the moment of vesting or exercise (so-called "dry income").`
      taxReliefBubble.innerHTML = `Unfortunately there is no favourable tax treatment available.
      <br>
      <br>
      Income of 3000 euros per employee per year is tax free if:
      <br>- if the shares are kept in deposit at the European Community bank determined by the employer and the representatives of the employees
      <br>- the shares are kept for at least 5 years after they where bought
      <br>- the employee proves every year that he still owns the shares.`
      
      break;
    case "estonia":
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

      infoBubble1.textContent = `Personal deductions are not included.If the deductions were included, the tax bill would normally be less, not more.`
      infoBubble2.textContent = `Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.`
      infoBubble3.textContent = `A favourable tax treatment is available, which allows postponing taxation from exercise to sale. Check the box to see result.`
      infoBubble4.textContent = ``
      taxReliefBubble.textContent = `There must be at least 3 years between the grant and exercise of the share options.
The 3 years starts from the date both parties have signed the agreement.
The Estonian Tax and Customs Board has to be notified of grant of the options, except if the grant agreement is signed digitally.
`
      
      break;
    case "cyprus":
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

      infoBubble1.textContent = `Progressive rates are taken into account, but personal deductions are not. If the personal deductions were included, the tax bill would normally be less, not more.`
      infoBubble2.textContent = `Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.`
      infoBubble3.textContent = ``
      infoBubble4.textContent = ``
      taxReliefBubble.textContent = `Unfortunately there is no favourable tax treatment available.
Sale of shares is generally tax free unless you sell shares in a company that holds immovable property in Cyprus.`
      
      break;
    case "germany":
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

      infoBubble1.textContent = `Progressive rates are taken into account, but personal deductions are not. If the personal deductions were included, the tax bill would normally be less, not more.`
      infoBubble2.textContent = `Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.`
      infoBubble3.textContent = `Social security contribution amount is average since they depend on personal circumstances or choices. Church tax and solidarity surcharge is not included.`
      infoBubble4.textContent = `A favourable tax treatment is available. Check the box to see result.`
      taxReliefBubble.textContent = `Favourable tax rules are available for start-ups and small companies which:
      
- employ less than 250 employees
- annual turnover is less than 50 MEUR and balance sheet maximum of 43 MEUR
- less than 12 years old at the time of employee participation`
      
      break;
    case "latvia":
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

      infoBubble1.textContent = `Progressive rates are taken into account, but personal deductions are not. If the personal deductions were included, the tax bill would normally be less, not more.`
      infoBubble2.textContent = `Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.`
      infoBubble3.textContent = `A favourable tax treatment is available, which allows postponing taxation from exercise to sale. Check the box to see result.`
      infoBubble4.textContent = ``
      taxReliefBubble.textContent = `There must be at least 1 year between the grant and exercise of the share options.
During the options are held, the optionholder must be employed by the company
Grant of options must be notified to the Latvian State Revenue service within 2 months.`
      
      break;
    case "lithuania":
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

      infoBubble1.textContent = `Progressive rates are taken into account, but personal deductions are not. If the personal deductions were included, the tax bill would normally be less, not more.`
      infoBubble2.textContent = `Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.`
      infoBubble3.textContent = `Social security contribution amount is average since they depend on personal circumstances or choices.`
      infoBubble4.textContent = `A favourable tax treatment is available, which allows postponing taxation from exercise to sale. Check the box to see result.`
      taxReliefBubble.textContent = `There must be at least 3 years between the grant and exercise of the share options.`
      
      break;
    case "malta":
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

      infoBubble1.textContent = `Personal deductions are not included.If the deductions were included, the tax bill would normally be less, not more.`
      infoBubble2.textContent = `Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.`
      infoBubble3.textContent = ``
      infoBubble4.textContent = ``
      taxReliefBubble.textContent = `Only company and group company employees are eligible.
Benefit on the exercise is taxed with income tax of 15%. Progressive rates do not apply. No social security contributions.
Company has to collect and keep the records to be able to prove correct valuation of fringe benefits.`
		  
      break;
    case "netherlands":
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

      infoBubble1.textContent = `Progressive rates are taken into account, but personal deductions are not. If the personal deductions were included, the tax bill would normally be less, not more.`
      infoBubble2.textContent = `Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.`
      infoBubble3.textContent = `Social security contribution amount is approximate since they are capped and depend on the exact amount of salary.`
      infoBubble4.textContent = `In general, capital gains on the disposal of shares are not taxed.`
      taxReliefBubble.textContent = `No special treatment for ESOP plans.
New tax rules for stock options apply from 1 January 2023:
- The tax point is at the exercise if the shares become tradable, i.e. the owner is able to sell the shares to any other person.`
      
      break;
    case "czechia":
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

      infoBubble1.textContent = `Progressive rates are taken into account, but personal deductions are not. If the personal deductions were included, the tax bill would normally be less, not more.`
      infoBubble2.textContent = `Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.`
      infoBubble3.textContent = `No special favourable treatment for stock options is available. Phantom or virtual share plans (VSOP) may sometimes achieve better tax results since income is taxed when payment is received instead of taxation of estimated value of shares at the moment of vesting or exercise (so-called "dry income").`
      infoBubble4.textContent = ``
      taxReliefBubble.textContent = `Unfortunately there is no favourable tax treatment available.
Sale of share is tax free if the shares are held for 3+ years.`
      
      break;
    case "denmark":
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

      infoBubble1.textContent = `Progressive rates are taken into account, but personal deductions are not. If the personal deductions were included, the tax bill would normally be less, not more.`
      infoBubble2.textContent = `Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.`
      infoBubble3.textContent = `Social security contributions are not included since they are almost nonexistent or depend on personal choices. Municipal tax and labour market tax are included.`
      infoBubble4.textContent = `A favourable tax treatment is available, which allows postponing taxation from exercise to sale. Check the box to see result.`
      taxReliefBubble.textContent = `Favourable tax rules apply to individual share-based remuneration plans ("section 7P" scheme).
Only employees are eligible. Cannot be applied to contractors, board members etc
Shares should be issued by the employer or the group company
Employee shares cannot constitute a separate class of shares
Allocated options cannot be assigned to anyone else
Allocation must not exceed 10% of the annual salary. Exceptions apply to start-ups and if plan is offered to 80% of the employees
Grant of options needs to be reported to the Tax Agency
Favourable tax treatment can be applied to directly acquired shares, purchase options and subscription rights.`
      
      break;
    case "poland":
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

      infoBubble1.textContent = `Progressive rates are taken into account, but personal deductions are not. If the personal deductions were included, the tax bill would normally be less, not more.`
      infoBubble2.textContent = `Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.`
      infoBubble3.textContent = `Social security contribution amount is average since they depend on personal circumstances or choices.`
      infoBubble4.textContent = `A favourable tax treatment is available, which allows postponing taxation from exercise to sale. Check the box to see result.`
      taxReliefBubble.textContent = `The issuer of the shares is a joint stock company.
The company is based in Poland or in another EU or EEA country, or in the country with which Poland has a tax treaty.
Awards are granted based on the shareholders resolution.
Tax advantage applies to incentive plans that correspond to the definition in the Polish income tax law.`
      
      break;
    case "georgia":
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

      infoBubble1.textContent = `Personal deductions are not included.If the deductions were included, the tax bill would normally be less, not more.`
      infoBubble2.textContent = `Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.`
      infoBubble3.textContent = ``
      infoBubble4.textContent = ``
      taxReliefBubble.textContent = `There is no special tax treatment for employee stock options. Stock options are considered taxable benefits from the employer.
Double taxation of the same income at exercise and sale might occur.
Sale of share is tax free if the shares are held for 2+ years.`
      
      break;
    case "romania":
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

      infoBubble1.textContent = `Personal deductions are not included.If the deductions were included, the tax bill would normally be less, not more.`
      infoBubble2.textContent = `Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.`
      infoBubble3.textContent = `A favourable tax treatment is available. Check the box to see result.`
      infoBubble4.textContent = ``
      taxReliefBubble.textContent = `There must be at least 1 year between the grant and exercise of the share options.
Employees and directors are eligible. Contractors and other collaborators are not.
ESOP should be implemented by the same company which shares are offered.
Health insurance (10%) is due on capital gains between 6 and 12 minimum gross salaries (3000 RON in 2023)`
      
      break;
    case "ukraine":
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

      infoBubble1.textContent = `Personal deductions are not included.If the deductions were included, the tax bill would normally be less, not more.`
      infoBubble2.textContent = `Taxes that usually must be paid by employers are also deducted from the employee's gain since this is a common practice in equity-sharing plans.`
      infoBubble3.textContent = ``
      infoBubble4.textContent = ``
      taxReliefBubble.textContent = `Unfortunately there is no favourable tax treatment available.
Double taxation of the same income at exercise and sale might occur.`
      
      break;
    default:
      
      break;
  }
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

updateData();

taxCountryField.onchange = () => {
    updateData();
};

treatmentToggle.addEventListener('change', updateData);

taxCountryField.addEventListener('input', updateData);
exercisePriceField.addEventListener('input', updateData);
valueOfSharesField.addEventListener('input', updateData);
sharesPriceField.addEventListener('input', updateData);
annualIncomeField.addEventListener('input', updateData);

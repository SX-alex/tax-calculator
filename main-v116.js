let calculatedCountry = "";
let type = "csop";

const setAttributeToLabel = (label, div) => {
    label.innerHTML = div.innerHTML;
    for (const attr of div.attributes) {
        label.setAttribute(attr.name, attr.value);
    }
}

const convertStringToNumber = (string) => {
    return parseFloat(string.replace(/,/g, ''));
}

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

function addText(element, text, index) {
    if (index <= text.length) {
        setTimeout(() => {
            element.textContent = text.slice(0, index);
            addText(element, text, index + 1);
        }, 60);
    }
}

const convertDivToLabel = (div) => {
    const labelElement = document.createElement("label");
    setAttributeToLabel( labelElement, div );
    div.parentNode.replaceChild(labelElement, div);
}

function formatInputWithCommas(inputElement) {
    const input = inputElement.value;
    const cursorPosition = inputElement.selectionStart;
    const prevLength = input.length;

    const numericInput = input.replace(/[^0-9]/g, '');

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

    const numericInput = input.replace(/[^0-9]/g, '');

    let cleanedInput = numericInput.replace(/^0+(?=\d)/, '');

    const formattedInput = cleanedInput.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const inputValue = formattedInput;

    inputElement.value = inputValue;

    let newCursorPosition = cursorPosition + (inputValue.length - prevLength);

    if (cursorPosition === prevLength && cursorPosition === input.length) {
        newCursorPosition = inputValue.length;
    }

    inputElement.setSelectionRange(newCursorPosition, newCursorPosition);
}

const setCountryCur = (country) => {
    let value = "";

    switch (country.toLowerCase()) {
        case "austria":
        case "estonia":
        case "cyprus":
        case "germany":
        case "latvia":
        case "lithuania":
        case "malta":
        case "croatia":
        case "greece":
        case "belgium":
        case "italy":
    	case "france":
    	case "spain":
    	case "finland":
    	case "portugal":
    	case "ireland":
	    case "slovakia":
    	case "slovenia":
    	case "luxembourg":
        case "netherlands":
            value = "EUR";
            break;
    	case "sweden":
            value = "SEK";
            break;
        case "czechia":
            value = "CZK";
            break;
        case "denmark":
            value = "DKK";
            break;
        case "poland":
            value = "PLN";
            break;
        case "georgia":
            value = "GEL";
            break;
        case "romania":
            value = "RON";
            break;
        case "ukraine":
            value = "UAH";
            break;
        case "united kingdom (csop)":
            value = "GBP";
            break;
        case "bulgaria":
            value = "BGN";
            break;
        case "hungary":
            value = "HUF";
            break;
        default:
            value = "EUR";
            break;
    }

    return value;
}

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

const taxCountryField = document.getElementById('tax-country-field');
const exercisePriceField = document.getElementById('exercise-price-field');
const valueOfSharesField = document.getElementById('value-of-shares-field');
const valueOfSharesGrantField = document.getElementById('value-of-shares-grant-field');
const sharesPriceField = document.getElementById('shares-price-field');
const annualIncomeField = document.getElementById('annual-income-field');
const currencyElements = document.getElementsByClassName('is--currency');

const treatmentToggle = document.getElementById('treatment-toggle');

function replaceTextAll(newText) {
    const removePromises = Array.from(currencyElements, element => {
        return new Promise(resolve => {
            const currentText = element.textContent;
            removeText(element, currentText, currentText.length, resolve);
        });
    });

    Promise.all(removePromises).then(() => {
        for (let i = 0; i < currencyElements.length; i++) {
            const element = currencyElements[i];
            addText(element, newText, 0);
        }
    });
}

taxCountryField.addEventListener('change', (event) => {
    const country = event.target.value;
    const currency = setCountryCur(country);
    replaceTextAll(currency);
    if (country === 'BELGIUM') {
        document.getElementById('value-of-shares-grant-group').style.display = "flex";
    }else{
        document.getElementById('value-of-shares-grant-group').style.display = "none";
    }
});

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

//toggle
const taxToggler = document.getElementById("tax-toggler");
const taxTogglerUk = document.getElementById("tax-toggler-uk");

const resoult = document.getElementById('results_wrapper');
const loading = document.getElementById('tax-loader-group');

resoult.style.display = "none";

let data;

const getData = () => {

    calculatedCountry = taxCountryField.value;

    resoult.style.display = "none";
    loading.style.display = "flex";

    if ( treatmentToggle.checked ){
        document.getElementById('tax-checkbox_toggle-false').click();
        document.getElementById('treatment-toggler').click();
    }

    document.getElementById('tax-switcher-csop').click();

    const country = taxCountryField.value ? taxCountryField.value.toUpperCase() : 'BULGARIA';
    const marketSharesValueGrant = valueOfSharesGrantField.value ? valueOfSharesGrantField.value : 300;
    const exercisePrice = exercisePriceField.value ? exercisePriceField.value : 1000;
    const marketSharesValue = valueOfSharesField.value ? valueOfSharesField.value : 100000;
    const salePrice = sharesPriceField.value ? sharesPriceField.value : 120000;
    const annualIncome = annualIncomeField.value ? annualIncomeField.value : 84000;
    const checkbox = treatmentToggle.value ? treatmentToggle.value : 'FALSE';

    const taxTipsBody = document.getElementById('tax-tips-body');
    const treatmentBody = document.getElementById('treatment-body');

    if (country === 'UK') {
        taxToggler.style.display = "none"
        taxTogglerUk.style.display = "grid"
    }else{
        taxToggler.style.display = "grid"
        taxTogglerUk.style.display = "none"
    }

    fetch(`https://hook.eu2.make.com/9oe758l33v638czzvz8p2ptwpcdy5gnw?country=${country}&marketSharesValueGrant=${marketSharesValueGrant}&exercisePrice=${exercisePrice}&marketSharesValue=${marketSharesValue}&salePrice=${salePrice}&annualIncome=${annualIncome}&checkbox=${checkbox}`)
    .then(function(response) {
        return response.json();
    })
    .then(function(myJson) {
        if (calculatedCountry.toLowerCase() === 'united kingdom (csop)') {
            document.getElementById('tax-toggler').style.display = 'none'
            document.getElementById('tax-toggler-uk').style.display = 'grid'
        }else{
            document.getElementById('tax-toggler').style.display = "grid";
            document.getElementById('tax-toggler-uk').style.display = "none";
        }
    
        data = myJson;
        loading.style.display = "none";
        resoult.style.display = "flex";

        switch (taxCountryField.value.toLowerCase()) {
            case "austria":
                taxTipsBody.innerHTML = `
                    <div>Tax rates are for 2024. They may change in the future.</div>
                    <div>We don’t include personal allowances or deductions, as we don’t require that level of detail. It's worth noting that including such amounts would lower, not raise, tax amounts.</div>
                    <div>For progressive tax, we calculate an average tax rate based on your input. This individual average rate is then applied to the portion of income from equity rewards.</div>
                    <div>If agreed upon in the grant agreement, employers' tax obligations can be deducted from the employee’s gain. The final number considers this scenario.</div>
                    <div>Social security contributions are average since they depend on personal circumstances.</div>
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

            case "cyprus":
                taxTipsBody.innerHTML = `
                    <div>Tax rates are for 2024. They may change in the future.</div>
                    <div>We don’t include personal allowances or deductions, as we don’t require that level of detail. It's worth noting that including such amounts would lower, not raise, tax amounts.</div>
                    <div>For progressive tax, we calculate an average tax rate based on your input. This individual average rate is then applied to the portion of income from equity rewards.</div>
                    <div>If agreed upon in the grant agreement, employers' tax obligations can be deducted from the employee’s gain. The final number considers this scenario.</div>
                    <div>Local municipalities set the income tax rates for each year. Rates of Zagreb are used in this calculation.</div>
                `
            
                treatmentBody.innerHTML = `
                <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
                    <li>Unfortunately there is no favourable tax treatment available.</li>
                    <li>Sale of shares is generally tax free unless you sell shares in a company that holds immovable property in Cyprus.</li>
                </ul>`
                break;

            case "czechia":
                taxTipsBody.innerHTML = `
                    <div>Tax rates are for 2024. They may change in the future. </div>
                    <div>We don’t include personal allowances or deductions, as we don’t require that level of detail. It's worth noting that including such amounts would lower, not raise, tax amounts.</div>
                    <div>For progressive tax, we calculate an average tax rate based on your input. This individual average rate is then applied to the portion of income from equity rewards.  </div>
                    <div>If agreed upon in the grant agreement, employers' tax obligations can be deducted from the employee’s gain. The final number considers this scenario.</div>
                    <div>Different social security contributions are totaled.</div>
                `
            
                treatmentBody.innerHTML = `
                <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
                    <li>Unfortunately there is no favourable tax treatment available.</li>
                    <li>Sale of share is tax free if the shares are held for 3+ years.</li>
                </ul>`
                break;

            case "denmark":
                taxTipsBody.innerHTML = `
                    <div>Tax rates are for 2024. They may change in the future. </div>
                    <div>We don’t include personal allowances or deductions, as we don’t require that level of detail. It's worth noting that including such amounts would lower, not raise, tax amounts.</div>
                    <div>For progressive tax, we calculate an average tax rate based on your input. This individual average rate is then applied to the portion of income from equity rewards.  </div>
                    <div>If agreed upon in the grant agreement, employers' tax obligations can be deducted from the employee’s gain. The final number considers this scenario.</div>
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

            case "estonia":
                taxTipsBody.innerHTML = `
                    <div>Tax rates are for 2024. They may change in the future. </div>
                    <div>We don’t include personal allowances or deductions, as we don’t require that level of detail. It's worth noting that including such amounts would lower, not raise, tax amounts.</div>
                    <div>If agreed upon in the grant agreement, employers' tax obligations can be deducted from the employee’s gain. The final number considers this scenario.</div>
                `
            
                treatmentBody.innerHTML = `
                <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
                    <li>There must be at least 3 years between the grant and exercise of the share options.</li>
                    <li>The 3 years starts from the date both parties have signed the agreement.</li>
                    <li>Grant of the options has to be notified to the Estonian Tax and Customs Board, except if the time of grant can be proved by digital signature or other similar timestamp.</li>
                </ul>`
                break;

            case "latvia":
                taxTipsBody.innerHTML = `
                    <div>Tax rates are for 2024. They may change in the future. </div>
                    <div>We don’t include personal allowances or deductions, as we don’t require that level of detail. It's worth noting that including such amounts would lower, not raise, tax amounts.</div>
                    <div>If agreed upon in the grant agreement, employers' tax obligations can be deducted from the employee’s gain. The final number considers this scenario.</div>
                `
            
                treatmentBody.innerHTML = `
                <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
                    <li>There must be at least 1 year between the grant and exercise of the share options.</li>
                    <li>During the options are held, the optionholder must be employed by the company.</li>
                    <li>Grant of options must be notified to the Latvian State Revenue service within 2 months.</li>
                </ul>`
                break;

            case "finland":
                taxTipsBody.innerHTML = `
                    <div>Tax rates are for 2024. They may change in the future. </div>
                    <div>We don’t include personal allowances or deductions, as we don’t require that level of detail. It's worth noting that including such amounts would lower, not raise, tax amounts.</div>
                    <div>For progressive tax, we calculate an average tax rate based on your input. This individual average rate is then applied to the portion of income from equity rewards.  </div>
                    <div>If agreed upon in the grant agreement, employers' tax obligations can be deducted from the employee’s gain. The final number considers this scenario.</div>
                    <div>Social security contribution amount is average since it depends on personal circumstances.</div>
                    <div>Municipal taxes (4.36%-10.86%), church tax (1%-2.10%) and public broadcasting tax are not included in the calculation.</div>
                `
            
                treatmentBody.innerHTML = `
                <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
                    <li>If ESOP corresponds to the Finnish Income Tax Law, the participants pay taxes at exercise (otherwise at grant).</li>
                    <li>Main conditions for the ESOP to be eligible for the favourable tax treatment: 
	                    <ul role="list" class="tax-treatment-sublist">
	                        <li>exercise price is below the market value</li>
	                        <li>employment is the basis of the option grant. Board and council members are included. Contractors are not included.</li>
	                    </ul>
		    </li>
                    <li>Tax relief from the employee's (and not the employer's) part of social security contributions is available if:
	                    <ul role="list" class="tax-treatment-sublist">
	                        <li>the exercise price is less than 50% of the market value</li>
	                        <li>options are exercised within one year from the grant.</li>
	                    </ul>
		    </li>
                </ul>`
                break;

            case "france":
                taxTipsBody.innerHTML = `
                    <div>Tax rates are for 2024. They may change in the future. </div>
                    <div>We don’t include personal allowances or deductions, as we don’t require that level of detail. It's worth noting that including such amounts would lower, not raise, tax amounts.</div>
                    <div>For progressive tax, we calculate an average tax rate based on your input. This individual average rate is then applied to the portion of income from equity rewards.  </div>
                    <div>If agreed upon in the grant agreement, employers' tax obligations can be deducted from the employee’s gain. The final number considers this scenario.</div>
                    <div>Surtax on high income (above 250,000 euros) is not included.</div>
                    <div>Tax relief is calculated assuming the company has employed the beneficiary for 3+ years. If not, the tax rate for capital gains is higher (47.2% instead of 30%).</div>
                    <div>Social security contribution amount is average since it depends on personal circumstances.</div>
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

            case "georgia":
                taxTipsBody.innerHTML = `
                    <div>Tax rates are for 2024. They may change in the future. </div>
                    <div>We don’t include personal allowances or deductions, as we don’t require that level of detail. It's worth noting that including such amounts would lower, not raise, tax amounts.</div>
                    <div>If agreed upon in the grant agreement, employers' tax obligations can be deducted from the employee’s gain. The final number considers this scenario.</div>
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
                taxTipsBody.innerHTML = `
                    <div>Tax rates are for 2024. They may change in the future. </div>
                    <div>We don’t include personal allowances or deductions, as we don’t require that level of detail. It's worth noting that including such amounts would lower, not raise, tax amounts.</div>
                    <div>If agreed upon in the grant agreement, employers' tax obligations can be deducted from the employee’s gain. The final number considers this scenario.</div>
                `
            
                treatmentBody.innerHTML = `
                <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
                    <li>There must be at least 1 year between the grant and exercise of the share options.</li>
                    <li>Employees and directors are eligible. Contractors and other collaborators are not.</li>
                    <li>ESOP should be implemented by the same company which shares are offered.</li>
                    <li>Health insurance (10%) is due on capital gains between 6 and 12 minimum gross salaries (3000 RON in 2023)</li>
                </ul>`
                break;

            case "united kingdom (emi)":
                taxTipsBody.innerHTML = `
                    <div>Tax rates and bands are for 2024/2025. They may change in the future. </div>
                    <div>We don’t include personal allowances or deductions, as we don’t require that level of detail. It's worth noting that including such amounts would lower, not raise, tax amounts.</div>
                    <div>For progressive or regressive tax, we calculate an average tax rate based on your input. This individual average rate is then applied to the portion of income from equity rewards.  </div>
                    <div>If agreed upon in the grant agreement, employers' tax obligations can be deducted from the employee’s gain. The final number considers this scenario.</div>
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
                break;

            case "united kingdom (csop)":
                taxTipsBody.innerHTML = `
                    <div>Tax rates and bands are for 2024/2025. They may change in the future. </div>
                    <div>We don’t include personal allowances or deductions, as we don’t require that level of detail. It's worth noting that including such amounts would lower, not raise, tax amounts.</div>
                    <div>For progressive or regressive tax, we calculate an average tax rate based on your input. This individual average rate is then applied to the portion of income from equity rewards.  </div>
                    <div>If agreed upon in the grant agreement, employers' tax obligations can be deducted from the employee’s gain. The final number considers this scenario.</div>
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
                break;
                
            case "bulgaria":
                taxTipsBody.innerHTML = `
                    <div>Tax rates are for 2024. They may change in the future. </div>
                    <div>We don’t include personal allowances or deductions, as we don’t require that level of detail. It's worth noting that including such amounts would lower, not raise, tax amounts.</div>
                    <div>For progressive tax, we calculate an average tax rate based on your input. This individual average rate is then applied to the portion of income from equity rewards.  </div>
                    <div>If agreed upon in the grant agreement, employers' tax obligations can be deducted from the employee’s gain. The final number considers this scenario.</div>
                    <div>Social security contributions are totaled and caps are taken into account.</div>
                `
            
                treatmentBody.innerHTML = `
                <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
                    <li>Unfortunately, there is no favourable tax treatment available for stock option programs. Tax laws do not regulate taxation of stock options.</li>
                    <li>It is possible that tax obligations arise already when options are granted. Taxation at grant is more likely if the options are transferrable. </li>
                    <li>Sale of shares is tax-free if the shares are listed on a regulated market within the European Economic Area.</li>
                </ul>`
                break;

            case "croatia":
                taxTipsBody.innerHTML = `
                    <div>Tax rates are for 2024. They may change in the future.</div>
                    <div>We don’t include personal allowances or deductions, as we don’t require that level of detail. It's worth noting that including such amounts would lower, not raise, tax amounts.</div>
                    <div>For progressive tax, we calculate an average tax rate based on your input. This individual average rate is then applied to the portion of income from equity rewards.  </div>
                    <div>If agreed upon in the grant agreement, employers' tax obligations can be deducted from the employee’s gain. The final number considers this scenario.</div>
                    <div>Local municipalities set the income tax rates for each year. Rates of Zagreb are used in this calculation.</div>
                `
            
                treatmentBody.innerHTML = `
                <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
                    <li>Stock options purchased at favourable price are treated as capital income (flat rate income tax and no social security payments)</li>
                    <li>VSOP income is treated as employment income (progressive tax rates + social security payments)</li>
                </ul>`
                break;

            case "greece":
                taxTipsBody.innerHTML = `
                    <div>Tax rates are for 2024. They may change in the future. </div>
                    <div>We don’t include personal allowances or deductions, as we don’t require that level of detail. It's worth noting that including such amounts would lower, not raise, tax amounts.</div>
                    <div>For progressive tax, we calculate an average tax rate based on your input. This individual average rate is then applied to the portion of income from equity rewards.  </div>
                    <div>If agreed upon in the grant agreement, employers' tax obligations can be deducted from the employee’s gain. The final number considers this scenario.</div>
                    <div>Transfer of the listed shares is tax-free on certain conditions. Transaction tax 0,2% on the listed shares is not included.</div>
                `
            
                treatmentBody.innerHTML = `
                <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
                    <li>The options must not be exercised before 24 months from their grant date.</li>
                    <li>In case of start-up companies, the holding requirement is 36 months, and capital gains tax is 5% instead of 15% for regular company shares.</li>
                    <li>Employer has to issue a written document at the exercise showing the amount of the benefit and the exact grant date of options.</li>
                    <li>If holding period is met, the benefit is treated as a capital gain. </li>
                    <li>If options are exercised before the end of the holding period, the benefit is taxed as a salary. However, the taxes are due when the shares are sold.</li>
                </ul>`
                break;

            case "hungary":
                taxTipsBody.innerHTML = `
                    <div>Tax rates are for 2024. They may change in the future. </div>
                    <div>We don’t include personal allowances or deductions, as we don’t require that level of detail. It's worth noting that including such amounts would lower, not raise, tax amounts.</div>
                    <div>If agreed upon in the grant agreement, employers' tax obligations can be deducted from the employee’s gain. The final number considers this scenario.</div>
                `
            
                treatmentBody.innerHTML = `
                <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
                    <li>Unfortunately, there is no favourable tax treatment available for stock option programs.</li>
                    <li>Taxation at grant is not likely, except if the options are transferrable.</li>
                    <li>Social tax obligations depend on the source of the income and the individual's social security position.</li>
                </ul>`
                break;

            case "italy":
                taxTipsBody.innerHTML = `
                    <div>Tax rates are for 2024. They may change in the future. </div>
                    <div>We don’t include personal allowances or deductions, as we don’t require that level of detail. It's worth noting that including such amounts would lower, not raise, tax amounts.</div>
                    <div>For progressive tax, we calculate an average tax rate based on your input. This individual average rate is then applied to the portion of income from equity rewards.  </div>
                    <div>If agreed upon in the grant agreement, employers' tax obligations can be deducted from the employee’s gain. The final number considers this scenario.”</div>
                    <div>Municipal, regional and financial transaction taxes are not included as their small amount low does not significantly affect the result.</div>
                `
            
                treatmentBody.innerHTML = `
                <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
                    <li>Favourable tax regime was abolished in 2008.</li>
                    <li>Income from stock option plans is taxable with regular progressive tax rates, but typically exempt from social security contributions.</li>
                    <li>The only applicable tax benefit is that earnings up to EUR 2065,83 are tax-free if: 
                        <ul role="list" class="tax-treatment-sublist">
                            <li>the shares are not sold back to the issuing company or </li>
                            <li>otherwise not transferred within 3 years from their assignment.</li>
                        </ul>
                    </li>
                </ul>`
                break;
                
            case "belgium":
                taxTipsBody.innerHTML = `
                    <div>Tax rates are for 2024. They may change in the future. </div>
                    <div>We don’t include personal allowances or deductions, as we don’t require that level of detail. It's worth noting that including such amounts would lower, not raise, tax amounts.</div>
                    <div>For progressive tax, we calculate an average tax rate based on your input. This individual average rate is then applied to the portion of income from equity rewards.  </div>
                    <div>If agreed upon in the grant agreement, employers' tax obligations can be deducted from the employee’s gain. The final number considers this scenario.</div>
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

            case "portugal":
                taxTipsBody.innerHTML = `
                    <div>Tax rates are for 2024. They may change in the future. </div>
                    <div>We don’t include personal allowances or deductions, as we don’t require that level of detail. It's worth noting that including such amounts would lower, not raise, tax amounts.</div>
                    <div>For progressive or regressive tax, we calculate an average tax rate based on your input. This individual average rate is then applied to the portion of income from equity rewards.  </div>
                    <div>If agreed upon in the grant agreement, employers' tax obligations can be deducted from the employee’s gain. The final number considers this scenario.</div>
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
                </ul>`
                break;

            case "spain":
                taxTipsBody.innerHTML = `
                    <div>Tax rates are for 2024. They may change in the future. </div>
                    <div>We don’t include personal allowances or deductions, as we don’t require that level of detail. It's worth noting that including such amounts would lower, not raise, tax amounts.</div>
                    <div>For progressive or regressive tax, we calculate an average tax rate based on your input. This individual average rate is then applied to the portion of income from equity rewards.  </div>
                    <div>State progressive rates are taken into account, but autonomous community taxes and personal deductions and allowances are not.</div>
                    <div>Social security contributions do not include variable tax rates for occupational accidents.</div>
                    <div>Tax-free gain for a startup employee of 50K and other employees of 12K per year are included in the calculation.</div>
                    <div>If agreed upon in the grant agreement, employers' tax obligations can be deducted from the employee’s gain. The final number considers this scenario.”</div>
                    <div>The market value of the shares at the exercise is determined based on the last investment round if independent third parties invested in the startup during the previous year.</div>
                `
            
                treatmentBody.innerHTML = `
                <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
                    <li>From 2023, startup employees can postpone taxation until the liquidity event.</li>
                    <li>Tax point is the earliest of: (1) sale of options or shares (2) company IPO (3) 10 years passed from grant</li>
                    <li>Eligible startup:
                        <ul role="list" class="tax-treatment-sublist">
                            <li>less than 5 yo, <5 MEUR annual revenues</li>
                            <li>office of the company and most of employees in Spain</li>
                            <li>standalone entity, not listed in stock exchange, no dividends distributed</li>
                            <li>with an innovative character approved by local agencies.</li>
                        </ul>
                    </li>
                </ul>`
                break;

            case "sweden":
                taxTipsBody.innerHTML = `
                    <div>Tax rates are for 2024. They may change in the future. </div>
                    <div>We don’t include personal allowances or deductions, as we don’t require that level of detail. It's worth noting that including such amounts would lower, not raise, tax amounts.</div>
                    <div>For progressive or regressive tax, we calculate an average tax rate based on your input. This individual average rate is then applied to the portion of income from equity rewards.  </div>
                    <div>Municipal tax rate varies between 29%-36%. Here we use average 32%.</div>
                    <div>If agreed upon in the grant agreement, employers' tax obligations can be deducted from the employee’s gain. The final number considers this scenario.</div>
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
                </ul>`
                break;

            case "slovenia":
                taxTipsBody.innerHTML = `
                    <div>Tax rates are for 2024. They may change in the future. </div>
                    <div>We don’t include personal allowances or deductions, as we don’t require that level of detail. It's worth noting that including such amounts would lower, not raise, tax amounts.</div>
                    <div>For progressive or regressive tax, we calculate an average tax rate based on your input. This individual average rate is then applied to the portion of income from equity rewards.  </div>
                    <div>If agreed upon in the grant agreement, employers' tax obligations can be deducted from the employee’s gain. The final number considers this scenario.</div>
                    <div>Tax rate for capital gains is 25%, although it can be lower depending on the holding time of the assets.</div>
                `
            
                treatmentBody.innerHTML = `
                <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
                    <li>Unfortunately, there is no favourable tax treatment available for stock option programs.</li>
                    <li>Tax on the sale of shares can be lower if the shares are held for longer than 5 years.</li>
                </ul>`
                break;

            case "luxembourg":
                taxTipsBody.innerHTML = `
                    <div>Tax rates are for 2024. They may change in the future. </div>
                    <div>We don’t include personal allowances or deductions, as we don’t require that level of detail. It's worth noting that including such amounts would lower, not raise, tax amounts.</div>
                    <div>For progressive or regressive tax, we calculate an average tax rate based on your input. This individual average rate is then applied to the portion of income from equity rewards.  </div>
                    <div>Average progressive rates and solidarity surcharge for Class 1 (single taxpayer) are the basis of the income tax calculation.</div>
                    <div>The upper limit of social security contributions is used (12.45% employee's, 14.92% employer's part). Contributions are capped at 146,824 euros.</div>
                    <div>For capital gains taxation, we assume the shareholding is below 10% and the shares are held for more than six months. If not, the tax is levied at progressive rates, although reliefs are available on certain conditions. </div>
                `
            
                treatmentBody.innerHTML = `
                <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
                    <li>Since 2021 the favourable tax treatment for stock options and warrants was abolished.</li>
                    <li>Tradable or transferable stock options are taxable at grant. </li>
                    <li>Non-tradable and non-transferable stock options are taxable at exercise.</li>
                </ul>`
                break;

            case "switzerland":
                taxTipsBody.innerHTML = `
                    <div>Tax rates are for 2024. They may change in the future. </div>
                    <div>We don’t include personal allowances or deductions, as we don’t require that level of detail. It's worth noting that including such amounts would lower, not raise, tax amounts.</div>
                    <div>For progressive or regressive tax, we calculate an average tax rate based on your input. This individual average rate is then applied to the portion of income from equity rewards.  </div>
                    <div>If agreed upon in the grant agreement, employers' tax obligations can be deducted from the employee’s gain. The final number considers this scenario.</div>
                    <div>Tax rate for capital gains is 25%, although it can be lower depending on the holding time of the assets.</div>
                `
            
                treatmentBody.innerHTML = `
                <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
                    <li>Unfortunately, there is no favourable tax treatment available for stock option programs.</li>
                </ul>`
                break;

            case "poland":
                taxTipsBody.innerHTML = `
                    <div>Tax rates are for 2024. They may change in the future. </div>
                    <div>We don’t include personal allowances or deductions, as we don’t require that level of detail. It's worth noting that including such amounts would lower, not raise, tax amounts.</div>
                    <div>For progressive or regressive tax, we calculate an average tax rate based on your input. This individual average rate is then applied to the portion of income from equity rewards.  </div>
                    <div>If agreed upon in the grant agreement, employers' tax obligations can be deducted from the employee’s gain. The final number considers this scenario.</div>
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

            case "netherlands":
                taxTipsBody.innerHTML = `
                    <div>Tax rates are for 2024. They may change in the future. </div>
                    <div>We don’t include personal allowances or deductions, as we don’t require that level of detail. It's worth noting that including such amounts would lower, not raise, tax amounts.</div>
                    <div>For progressive or regressive tax, we calculate an average tax rate based on your input. This individual average rate is then applied to the portion of income from equity rewards.  </div>
                    <div>If agreed upon in the grant agreement, employers' tax obligations can be deducted from the employee’s gain. The final number considers this scenario.</div>
                    <div>Social security contributions amount is approximate since the payments are capped depending on the exact amount of salary.</div>
                `
            
                treatmentBody.innerHTML = `
                <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
                    <li>No special treatment for ESOP plans.</li>
                    <li>New tax rules for stock options apply from 1 January 2023:
                        <ul role="list" class="tax-treatment-sublist">
                            <li>The tax point is at the exercise if the shares become tradable, i.e. there are no restrictions to trasfer the shares to any other person.</li>
                        </ul>
                    </li>
                    <li>Capital gains from the sale of shares are tax-free, if the participation sold in the entity is less than 5%.</li>
                </ul>`
                break;

            case "malta":
                taxTipsBody.innerHTML = `
                    <div>Tax rates are for 2024. They may change in the future. </div>
                    <div>We don’t include personal allowances or deductions, as we don’t require that level of detail. It's worth noting that including such amounts would lower, not raise, tax amounts.</div>
                    <div>For progressive or regressive tax, we calculate an average tax rate based on your input. This individual average rate is then applied to the portion of income from equity rewards.  </div>
                    <div>If agreed upon in the grant agreement, employers' tax obligations can be deducted from the employee’s gain. The final number considers this scenario.</div>
                `
            
                treatmentBody.innerHTML = `
                <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
                    <li>Only company and group company employees can participate.</li>
                    <li>Benefit on the exercise is taxed with income tax of 15%. Progressive rates do not apply. No social security contributions.</li>
                    <li>Company has to collect and keep the records to be able to prove the correct valuation of fringe benefits.</li>
                </ul>`
                break;
            
            case "germany":
                taxTipsBody.innerHTML = `
                    <div>Tax rates are for 2024. They may change in the future. </div>
                    <div>We don’t include personal allowances or deductions, as we don’t require that level of detail. It's worth noting that including such amounts would lower, not raise, tax amounts.</div>
                    <div>For progressive or regressive tax, we calculate an average tax rate based on your input. This individual average rate is then applied to the portion of income from equity rewards.  </div>
                    <div>If agreed upon in the grant agreement, employers' tax obligations can be deducted from the employee’s gain. The final number considers this scenario.</div>
                    <div>Social security contribution amount is average and caps are included.</div>
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
                            <li>sale or transfer of shares;</li>
                            <li>termination of employment agreement, or</li>
                            <li>15 years passed from exercise.</li>
                        </ul>
                    </li>
                    <li>However, the termination of employment is not yet the tax point if the employer is ready to take the full liability to pay any possible wage tax.</li>
                    <li>Employees of any company can enjoy tax allowance of 2000 eur in a year at the point of exercise.</li>
                </ul>`
                break;

            case "ireland":
                taxTipsBody.innerHTML = `
                    <div>Tax rates are for 2024. They may change in the future. </div>
                    <div>We don’t include personal allowances or deductions, as we don’t require that level of detail. It's worth noting that including such amounts would lower, not raise, tax amounts.</div>
                    <div>For progressive tax, we calculate an average tax rate based on your input. This individual average rate is then applied to the portion of income from equity rewards.  </div>
                    <div>For equity-sharing plans, income tax and social security contributions are calculated at higher rates. Lower rate can be applied with prior approval from the Irish Revenue.</div>
                    <div>Stock options without tax relief here are 'short' unapproved options. They don't need approval from the Irish tax authority, but they should be exercised within 7 years from their grant. </div>
                    <div>Long (unapproved) options are exercisable for more than 7 years, but they may be taxed already at grant if the exercise price is set lower than the market value of the shares at the moment of grant.</div>
                    <div>Tax obligations arising from unapproved plans are the employee's sole responsibility, who must report and pay taxes within 30 days of the exercise.</div>
                `
            
                treatmentBody.innerHTML = `
                <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
                    <li>Qualifying companies to grant KEEP (Key employee engagement plan):
                        <ul role="list" class="tax-treatment-sublist">
                            <li>SMEs, i.e. employing <250 persons and having annual turnover up to 50 MEUR or balance sheet <43 MEUR. Must not be listed in a stock exchange.</li>
                            <li>incorporated in Ireland or, if incorporated in EEA or UK, carrying business through a branch in Ireland.</li>
                        </ul>
                    </li>
                    <li>Options can be granted to full-time employees or directors if they don't hold more than 15% of the qualifying company.</li>
                    <li>Options are exercised no earlier than one year or later than 10 years from the grant.</li>
                    <li>Shares acquired through exercise must be new ordinary shares in the qualifying company.</li>
                    <li>Share options must be granted at the market value of the same class of shares at the grant date.</li>
                </ul>`
                break;

            case "lithuania":
                taxTipsBody.innerHTML = `
                    <div>Tax rates are for 2024. They may change in the future. </div>
                    <div>We don’t include personal allowances or deductions, as we don’t require that level of detail. It's worth noting that including such amounts would lower, not raise, tax amounts.</div>
                    <div>For progressive tax, we calculate an average tax rate based on your input. This individual average rate is then applied to the portion of income from equity rewards.  </div>
                    <div>If agreed upon in the grant agreement, employers' tax obligations can be deducted from the employee’s gain. The final number considers this scenario.</div>
                    <div>Social security contribution amount is average. Caps are included.</div>
                `
            
                treatmentBody.innerHTML = `
                <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
                    <li>There must be at least 3 years between the grant and exercise of the share options.</li>
                </ul>`
                break;

            case "lithuania":
                taxTipsBody.innerHTML = `
                    <div>Tax rates are for 2024. They may change in the future. </div>
                    <div>We don’t include personal allowances or deductions, as we don’t require that level of detail. It's worth noting that including such amounts would lower, not raise, tax amounts.</div>
                    <div>For progressive tax, we calculate an average tax rate based on your input. This individual average rate is then applied to the portion of income from equity rewards.  </div>
                    <div>If agreed upon in the grant agreement, employers' tax obligations can be deducted from the employee’s gain. The final number considers this scenario.</div>
                    <div>Income tax, social security contributions and health insurance are included in the calculation. Other smaller amounts of different social security payments are not included.</div>
                `
            
                treatmentBody.innerHTML = `
                <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
                    <li>Unfortunately, there is no favourable tax treatment available for stock option programs.</li>
                    <li>When options are exercised, the benefit in kind received in shares is taxed as a salary.</li>
                    <li>From 2024, sale of shares in a private joint stock company is tax free if the shares are held for at least 3 years.</li>
                    <li>Sale of listed shares is tax free if the shares are held for at least 1 year.</li>
                    <li>Exit tax might be applicable for persons who stop being tax residents of Slovakia.</li>
                </ul>`
                break;

            case "ukraine":
                taxTipsBody.innerHTML = `
                    <div>Tax rates are for 2024. They may change in the future. </div>
                    <div>We don’t include personal allowances or deductions, as we don’t require that level of detail. It's worth noting that including such amounts would lower, not raise, tax amounts.</div>
                    <div>If agreed upon in the grant agreement, employers' tax obligations can be deducted from the employee’s gain. The final number considers this scenario.”</div>
                `
            
                treatmentBody.innerHTML = `
                <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
                    <li>Unfortunately there is no favourable tax treatment available.</li>
                    <li>Double taxation of the same income at exercise and sale might occur.</li>
                </ul>`
                break;
        
            default:

        }

        const yourCostBar = document.getElementById('your-cost-bar');
        const totalTaxesBar = document.getElementById('total-taxes-bar');
        const yourGainBar = document.getElementById('your-gain-bar');

        const yourCostOut = document.getElementById('your-cost-out');
        const totalTaxesOut = document.getElementById('total-taxes-out');
        const yourGainOut = document.getElementById('your-gain-out');

        yourCostBar.style.height = Math.abs( ( convertStringToNumber(data.employeeCost) / convertStringToNumber(data.salePrice) ) * 100)+ "%";
        totalTaxesBar.style.height = Math.ceil( ( convertStringToNumber(data.taxesESOP) / convertStringToNumber(data.salePrice) ) * 100) + "%";
        yourGainBar.style.height = Math.ceil( ( convertStringToNumber(data.finalTaxedGain) / convertStringToNumber(data.salePrice) ) * 100) + "%";

        yourCostOut.textContent = data.employeeCost;
        totalTaxesOut.textContent = `-${data.taxesESOP}`;
        yourGainOut.textContent = data.finalTaxedGain;

        document.getElementById('out-tax-point').textContent = data.taxableEvent;
        document.getElementById('out-benefit').textContent = data.shareBenefit;
        document.getElementById('employee-taxes-benefit').textContent = data.employeeBenefit;
        document.getElementById('out-income-taxes').textContent = data.incomeTax;
        document.getElementById('out-social-security').textContent = data.socialSecurity;
        document.getElementById('out-capital-gain').textContent = data.taxebleCapitalGain;
        document.getElementById('out-capital-gains').textContent = data.capitalGain;
        document.getElementById('taxes-esop').textContent = data.taxesESOP;
        document.getElementById('share-sales-price').textContent = data.salePrice;
        document.getElementById('final-gain').textContent = data.finalTaxedGain;
        document.getElementById('employee-cost').textContent = data.employeeCost;
        document.getElementById('monetary-gain').textContent = data.monetaryGain;
        document.getElementById('employee-taxes').textContent = data.employeeTaxes;
        document.getElementById('employee-gain').textContent = data.employeeGain;
        document.getElementById('employer-taxes').textContent = data.employerTaxes;
        document.getElementById('employer-taxes-on-benefit').textContent = data.taxesBenefit;

        const totalTaxesBarVsop = document.getElementById('total-taxes-bar__vsop');
        const yourGainBarVsop = document.getElementById('your-gain-bar__vsop');

        totalTaxesBarVsop.style.height = Math.ceil( ( convertStringToNumber(data.allTaxesOnVsop) / convertStringToNumber(data.salePrice) ) * 100) + "%";
        yourGainBarVsop.style.height = Math.ceil( ( convertStringToNumber(data.finalGainVsop) / convertStringToNumber(data.salePrice) ) * 100) + "%";

        document.getElementById('total-taxes-out__vsop').textContent = `-${data.allTaxesOnVsop}`;
        document.getElementById('your-gain-out__vsop').textContent = data.finalGainVsop;

        document.getElementById('out-vsop-tax-point').textContent = data.taxableEventVsop;
        document.getElementById('out-vsop-payment').textContent = data.paymentAmountVsop;
        document.getElementById('employee-taxes-vsop').textContent = data.employeeTaxesVsop;
        document.getElementById('out-vsop-income-taxes').textContent = data.incomeTaxVsop;
        document.getElementById('out-vsop-social-security').textContent = data.socialSecurityContributionsVsop;
        document.getElementById('employer-taxes-vsop').textContent = data.employerTaxesVsop;
        document.getElementById('all-taxes-vsop').textContent = data.allTaxesOnVsop;
        document.getElementById('payment-vsop').textContent = data.paymentFromVsop;
        document.getElementById('final-gain-vsop').textContent = data.finalGainVsop;
        document.getElementById('employee-cost-vsop').textContent = data.employeeCostVsop;
        document.getElementById('monetary-gain-vsop').textContent = data.monetaryIncomeVsop;
        document.getElementById('employee-taxes-vsop-total').textContent = data.employeeTaxesVsopTotal;
        document.getElementById('employee-gain-vsop').textContent = data.employeeGainVsop;
        document.getElementById('employer-taxes-vsop-total').textContent = data.employerTaxesVsopTotal;

        console.log(data);
    })
}

treatmentToggle.addEventListener('change', function () {
    if ( treatmentToggle.checked ){
        document.getElementById('tax-checkbox_toggle-true').click();

        if (calculatedCountry.toLowerCase() === 'united kingdom (csop)' && type === 'emi'){
            document.getElementById('out-capital-gains').textContent = data.emiTaxCapitalGainCH;
            document.getElementById('taxes-esop').textContent = data.emiAllTaxesCH;
            document.getElementById('employee-taxes').textContent = `${data.emiFinalEmployeeTaxCH}`;
            document.getElementById('employee-gain').textContent = data.emiFinalEmployeeTaxCHTotal;
            document.getElementById('final-gain').textContent = data.emiFinalGainCH;
            document.getElementById('employer-taxes').textContent = '0';

            document.getElementById('out-income-taxes').textContent = data.incomeTaxChecked;
            document.getElementById('out-social-security').textContent = data.socialSecurityContributionsChecked;
            document.getElementById('employee-taxes-benefit').textContent = data.employeeTaxesBenefitChecked;
            document.getElementById('out-capital-gain').textContent = data.taxableCapitalGainChecked;            
            document.getElementById('employer-taxes-on-benefit').textContent = data.employerTaxesBenefitChecked;
            document.getElementById('out-tax-point').textContent = data.taxPointChecked;
        }else{
            document.getElementById('out-income-taxes').textContent = data.incomeTaxChecked;
            document.getElementById('out-social-security').textContent = data.socialSecurityContributionsChecked;
            document.getElementById('employee-taxes-benefit').textContent = data.employeeTaxesBenefitChecked;
            document.getElementById('out-capital-gain').textContent = data.taxableCapitalGainChecked;
            document.getElementById('out-capital-gains').textContent = data.taxCapitalGainChecked;
            document.getElementById('taxes-esop').textContent = data.allEmployeeTaxesESOPChecked;
            document.getElementById('employee-taxes').textContent = data.employeeTaxesChecked;
            document.getElementById('employee-gain').textContent = data.employeeGainChecked;
            document.getElementById('employer-taxes').textContent = data.employerTaxesChecked;
            document.getElementById('employer-taxes-on-benefit').textContent = data.employerTaxesBenefitChecked;
            document.getElementById('out-tax-point').textContent = data.taxPointChecked;
            document.getElementById('final-gain').textContent = data.finalGainChecked;
        }

        const yourCostOut = document.getElementById('your-cost-out');
        const totalTaxesOut = document.getElementById('total-taxes-out');
        const yourGainOut = document.getElementById('your-gain-out');

        yourCostOut.textContent = data.employeeCost;
        totalTaxesOut.textContent = `-${data.allEmployeeTaxesESOPChecked}`;
        yourGainOut.textContent = data.finalGainChecked;

        const yourCostBar = document.getElementById('your-cost-bar');
        const totalTaxesBar = document.getElementById('total-taxes-bar');
        const yourGainBar = document.getElementById('your-gain-bar');

        yourCostBar.style.height = Math.abs( ( convertStringToNumber(data.employeeCost) / convertStringToNumber(data.salePrice) ) * 100)+ "%";
        totalTaxesBar.style.height = Math.ceil( ( convertStringToNumber(data.taxesESOP) / convertStringToNumber(data.salePrice) ) * 100) + "%";
        yourGainBar.style.height = Math.ceil( ( convertStringToNumber(data.finalTaxedGain) / convertStringToNumber(data.salePrice) ) * 100) + "%";
    }else{
        document.getElementById('tax-checkbox_toggle-false').click();

        if (calculatedCountry.toLowerCase() === 'united kingdom (csop)' && type === 'emi'){
            document.getElementById('out-capital-gains').textContent = data.emiTaxCapitalGain;
            document.getElementById('taxes-esop').textContent = data.emiAllTaxes;
            document.getElementById('employee-taxes').textContent = `-${data.emiFinalEmployeeTax}`;
            document.getElementById('employee-gain').textContent = data.emiFinalEmployeeGain;
            document.getElementById('final-gain').textContent = data.emiFinalGain;

            document.getElementById('out-income-taxes').textContent = data.incomeTax;
            document.getElementById('out-social-security').textContent = data.socialSecurity;
            document.getElementById('employee-taxes-benefit').textContent = data.employeeBenefit;
            document.getElementById('out-capital-gain').textContent = data.taxebleCapitalGain;
            document.getElementById('employer-taxes').textContent = data.employerTaxes;
            document.getElementById('employer-taxes-on-benefit').textContent = data.taxesBenefit;
            document.getElementById('out-tax-point').textContent = data.taxableEvent;
        }else{
            document.getElementById('out-income-taxes').textContent = data.incomeTax;
            document.getElementById('out-social-security').textContent = data.socialSecurity;
            document.getElementById('employee-taxes-benefit').textContent = data.employeeBenefit;
            document.getElementById('out-capital-gain').textContent = data.taxebleCapitalGain;
            document.getElementById('out-capital-gains').textContent = data.capitalGain;
            document.getElementById('taxes-esop').textContent = data.taxesESOP;
            document.getElementById('employee-taxes').textContent = data.employeeTaxes;
            document.getElementById('employee-gain').textContent = data.employeeGain;
            document.getElementById('employer-taxes').textContent = data.employerTaxes;
            document.getElementById('employer-taxes-on-benefit').textContent = data.taxesBenefit;
            document.getElementById('out-tax-point').textContent = data.taxableEvent;
            document.getElementById('final-gain').textContent = data.finalTaxedGain;
        }

        const yourCostOut = document.getElementById('your-cost-out');
        const totalTaxesOut = document.getElementById('total-taxes-out');
        const yourGainOut = document.getElementById('your-gain-out');

        yourCostOut.textContent = data.employeeCost;
        totalTaxesOut.textContent = `-${data.taxesESOP}`;
        yourGainOut.textContent = data.finalTaxedGain;

        const yourCostBar = document.getElementById('your-cost-bar');
        const totalTaxesBar = document.getElementById('total-taxes-bar');
        const yourGainBar = document.getElementById('your-gain-bar');

        yourCostBar.style.height = Math.abs( ( convertStringToNumber(data.employeeCost) / convertStringToNumber(data.salePrice) ) * 100)+ "%";
        totalTaxesBar.style.height = Math.ceil( ( convertStringToNumber(data.taxesESOP) / convertStringToNumber(data.salePrice) ) * 100) + "%";
        yourGainBar.style.height = Math.ceil( ( convertStringToNumber(data.finalTaxedGain) / convertStringToNumber(data.salePrice) ) * 100) + "%";
    }
});

document.getElementById('tax-switcher-emi').addEventListener('click', function () {
    if ( treatmentToggle.checked ){
        document.getElementById('tax-checkbox_toggle-false').click();
        document.getElementById('treatment-toggler').click();
    }

    type = 'emi';

    document.getElementById('out-capital-gains').textContent = data.emiTaxCapitalGain;
    document.getElementById('taxes-esop').textContent = data.emiAllTaxes;
    document.getElementById('employee-taxes').textContent = data.emiFinalEmployeeTax;
    document.getElementById('employee-gain').textContent = data.emiFinalEmployeeGain;
    document.getElementById('final-gain').textContent = data.emiFinalGain;
});

document.getElementById('tax-switcher-csop').addEventListener('click', function () {
    if ( treatmentToggle.checked ){
        document.getElementById('tax-checkbox_toggle-false').click();
        document.getElementById('treatment-toggler').click();
    }

    type = 'csop';

    if (data){
        document.getElementById('out-capital-gains').textContent = data.capitalGain;
        document.getElementById('taxes-esop').textContent = data.taxesESOP;
        document.getElementById('employee-taxes').textContent = data.employeeTaxes;
        document.getElementById('employee-gain').textContent = data.employeeGain;
        document.getElementById('final-gain').textContent = data.finalTaxedGain;
    }
});


const button = document.getElementById('button');

button.addEventListener('click', getData);

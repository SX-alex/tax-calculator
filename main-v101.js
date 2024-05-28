const setAttributeToLabel = (label, div) => {
    label.innerHTML = div.innerHTML;
    for (const attr of div.attributes) {
        label.setAttribute(attr.name, attr.value);
    }
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
        case "united Kingdom":
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

    resoult.style.display = "none";
    loading.style.display = "flex";

    const country = taxCountryField.value ? taxCountryField.value.toUpperCase() : 'BULGARIA';
    const marketSharesValueGrant = valueOfSharesGrantField.value ? valueOfSharesGrantField.value : 2000;
    const exercisePrice = exercisePriceField.value ? exercisePriceField.value : 0;
    const marketSharesValue = valueOfSharesField.value ? valueOfSharesField.value : 2000;
    const salePrice = sharesPriceField.value ? sharesPriceField.value : 0;
    const annualIncome = annualIncomeField.value ? annualIncomeField.value : 84000;
    const checkbox = treatmentToggle.value ? 'TRUE': 'FALSE';

    const taxTipsBody = document.getElementById('tax-tips-body');
    const treatmentBody = document.getElementById('treatment-body');

    if (country === 'UK') {
        taxToggler.style.display = "none"
        taxTogglerUk.style.display = "grid"
    }else{
        taxToggler.style.display = "grid"
        taxTogglerUk.style.display = "none"
    }

    const convertStringToNumber = (string) => {
        return parseFloat(string.replace(/,/g, ''));
    }

    fetch(`https://hook.eu2.make.com/8wmuudfj8f1sa7d9wha8vt2jq7ykgbxl?country=${country}&marketSharesValueGrant=${marketSharesValueGrant}&exercisePrice=${exercisePrice}&marketSharesValue=${marketSharesValue}&salePrice=${salePrice}&annualIncome=${annualIncome}&checkbox=${checkbox}`)
    .then(function(response) {
        return response.json();
    })
    .then(function(myJson) {
        data = myJson;
        loading.style.display = "none";
        resoult.style.display = "flex";

        switch (taxCountryField.value.toLowerCase()) {
            case "austria":
                taxTipsBody.innerHTML = `
                    <div>Tax rates are for 2024. They may change in the future.</div>
                    <div>We don’t include personal allowances or deductions, as we don’t require that level of detail. It's worth noting that including such amounts would lower, not raise, tax amounts.</div>
                    <div>For progressive tax, we calculate an average tax rate based on your input. This individual average rate is then applied to the portion of income from equity rewards. You'll see the applied rate displayed alongside the amounts.</div>
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
                    <div>For progressive tax, we calculate an average tax rate based on your input. This individual average rate is then applied to the portion of income from equity rewards. You'll see the applied rate displayed alongside the amounts.</div>
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
                    <div>For progressive tax, we calculate an average tax rate based on your input. This individual average rate is then applied to the portion of income from equity rewards. You'll see the applied rate displayed alongside the amounts.</div>
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
                    <div>For progressive tax, we calculate an average tax rate based on your input. This individual average rate is then applied to the portion of income from equity rewards. You'll see the applied rate displayed alongside the amounts.</div>
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
                    <div>For progressive tax, we calculate an average tax rate based on your input. This individual average rate is then applied to the portion of income from equity rewards. You'll see the applied rate displayed alongside the amounts.</div>
                    <div>If agreed upon in the grant agreement, employers' tax obligations can be deducted from the employee’s gain. The final number considers this scenario.</div>
                    <div>Social security contribution amount is average since it depends on personal circumstances.</div>
                    <div>Municipal taxes (4.36%-10.86%), church tax (1%-2.10%) and public broadcasting tax are not included in the calculation.</div>
                `
            
                treatmentBody.innerHTML = `
                <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
                    <li>There must be at least 1 year between the grant and exercise of the share options.</li>
                    <li>During the options are held, the optionholder must be employed by the company.</li>
                    <li>Grant of options must be notified to the Latvian State Revenue service within 2 months.</li>
                </ul>`
                break;

            case "france":
                taxTipsBody.innerHTML = `
                    <div>Tax rates are for 2024. They may change in the future. </div>
                    <div>We don’t include personal allowances or deductions, as we don’t require that level of detail. It's worth noting that including such amounts would lower, not raise, tax amounts.</div>
                    <div>For progressive tax, we calculate an average tax rate based on your input. This individual average rate is then applied to the portion of income from equity rewards. You'll see the applied rate displayed alongside the amounts.</div>
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
                    <div>For progressive or regressive tax, we calculate an average tax rate based on your input. This individual average rate is then applied to the portion of income from equity rewards. You'll see the applied rate displayed alongside the amounts.</div>
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
                    <div>For progressive or regressive tax, we calculate an average tax rate based on your input. This individual average rate is then applied to the portion of income from equity rewards. You'll see the applied rate displayed alongside the amounts.</div>
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
                
            case "croatia":
                taxTipsBody.innerHTML = `
                    <div>Tax rates are for 2024. They may change in the future.</div>
                    <div>We don’t include personal allowances or deductions, as we don’t require that level of detail. It's worth noting that including such amounts would lower, not raise, tax amounts.</div>
                    <div>For progressive tax, we calculate an average tax rate based on your input. This individual average rate is then applied to the portion of income from equity rewards. You'll see the applied rate displayed alongside the amounts.</div>
                    <div>If agreed upon in the grant agreement, employers' tax obligations can be deducted from the employee’s gain. The final number considers this scenario.</div>
                    <div>Local municipalities set the income tax rates for each year. Rates of Zagreb are used in this calculation.</div>
                `
            
                treatmentBody.innerHTML = `
                <ul role="list" class="tax-treatment-list text is--color-neutral-900 is--caption is--regular">
                    <li>Stock options purchased at favourable price are treated as capital income (flat rate income tax and no social security payments)</li>
                    <li>VSOP income is treated as employment income (progressive tax rates + social security payments)</li>
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
        document.getElementById('out-benefit').textContent = data.employeeBenefit;
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
        document.getElementById('employee-taxes-vsop-total').textContent = data.employerTaxesVsopTotal;
        document.getElementById('employee-gain-vsop').textContent = data.finalGainVsop;
        document.getElementById('employer-taxes-vsop-total').textContent = data.employerTaxesVsop;

        console.log(data);
    })
}

treatmentToggle.addEventListener('change', function () {
    if ( treatmentToggle.checked ){
        document.getElementById('tax-checkbox_toggle-true').click();

        document.getElementById('out-income-taxes').textContent = data.incomeTaxChecked;
        document.getElementById('out-social-security').textContent = data.socialSecurityContributionsChecked;
        document.getElementById('employee-taxes-benefit').textContent = data.employeeTaxesBenefitChecked;
        document.getElementById('out-capital-gain').textContent = data.taxableCapitalGainChecked;
        document.getElementById('out-capital-gains').textContent = data.taxCapitalGainChecked;
        document.getElementById('taxes-esop').textContent = data.allEmployeeTaxesESOPChecked;
        document.getElementById('employee-taxes').textContent = data.employeeGainChecked;
        document.getElementById('employee-gain').textContent = data.employerTaxesChecked;
        document.getElementById('employer-taxes').textContent = data.finalGainChecked;
        document.getElementById('employer-taxes-on-benefit').textContent = data.employerTaxesBenefitChecked;
    }else{
        document.getElementById('tax-checkbox_toggle-false').click();

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
    }
});

const button = document.getElementById('button');

button.addEventListener('click', getData);

const loadingScreen = document.querySelector('.loading')
const currYear = document.querySelectorAll('.curr-year')

const navLogo = document.querySelector('.nav-logo')
const errorLogo = document.querySelector('.error-logo')
const popupLogo = document.querySelector('.pop-up-modal img')
const footerLogo = document.querySelector('.footer-logo img')
const footerElement = document.querySelector('.design-element')
const copyrightStatement = document.querySelectorAll('.copy-r a')

const bannerHeading = document.querySelector('.page-heading')
const generateLinkBtn = document.querySelector('.generate-link-btn')
const viewLinkBtn = document.querySelector('.view-link-btn')
const customerInfoOut = document.querySelector('.ci-wrapper')
const checklistOut = document.querySelector('.checklist-out')
const advisorNotes = document.querySelector('.notes-out')
const imageOut = document.querySelector('.image-grid')

const advisorNotesSection = document.querySelector('.advisor-notes')
const imgLoading = document.querySelector('.img-loading')
const imgSection = document.querySelector('.image-grid')
const inspectionImgSection = document.querySelector('.inspection-images-wrapper')

const popUpModal = document.querySelector('.pop-up-modal')
const modalCloseBtn = document.querySelector('.modal-close-btn')
const customerLink = document.querySelector('.customer-link')
// const copyLinkBtn = document.querySelector('.copy-btn')

const errorScreen = document.querySelector('.error')

const pdfDownloadBtn = document.querySelector('.download-btn')
const loaderOverlay = document.querySelector('.loader-overlay')

const date = new Date()
const year = date.getFullYear()

let Tid = ''
let roleName = ''

let paramString = ''

let accessToken
let btnFlag = false

currYear.forEach(item => {
    item.innerText = year
})

let inspectionType

window.onload = () => {
    starter()
}

async function starter() {
    errorScreen.classList.add('hide')

    const encodedUrl = new URL(window.location.href);
    paramString = encodedUrl.search
    let idParam = encodedUrl.searchParams.get('id');
    let roleParam = encodedUrl.searchParams.get('r');
    let typeParam = encodedUrl.searchParams.get('t');
    let genLinkBtnParam = encodedUrl.searchParams.get('glbtn');
    let viewLinkBtnParam = encodedUrl.searchParams.get('vlbtn');

    let decodedIdParam = decodeURL(idParam)
    let decodedRoleParam = decodeURL(roleParam)
    let decodedTypeParam = decodeURL(typeParam)

    // ? decrypting logic
    let key = "s&a8Q!q#24f@L7oR";
    let decryptedTid = await CryptoJS.AES.decrypt(decodedIdParam, key).toString(CryptoJS.enc.Utf8)
    let decryptedRole = await CryptoJS.AES.decrypt(decodedRoleParam, key).toString(CryptoJS.enc.Utf8)
    let decryptedType = await CryptoJS.AES.decrypt(decodedTypeParam, key).toString(CryptoJS.enc.Utf8)

    inspectionType = decryptedType
    Tid = decryptedTid
    roleName = decryptedRole

    //console.log(Tid);
    //console.log('r',roleName);


    getData(decryptedTid, genLinkBtnParam, viewLinkBtnParam)
}

function decodeURL(url) {
    let decodedString = decodeURIComponent(url);

    return decodedString;
}

function getData(transId, generateLinkBtnParam, viewLinkBtnParam) {

    // if (!transId) {
    //     loadingScreen.style.display = "none"
    //     errorScreen.classList.remove('hide')
    //     return
    // }

    try {



        fetch('data.json')
            // fetch(`https://geapps.germanexperts.ae:7007/api/generalcrmapigettechnicalinspection/${transId}`, {
            //     method: 'GET',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     }
            // })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }
                return res.json()
            })
            .then(data => {

                styleChangeBasedOnBranch(data)

                populateBanner()
                populateCustomerInfo(data)
                populateChecklist(data)
                populateAdvisorNotes(data)

                fetchInspectionImages(data)

                if (roleName == 'Service Advisor') {

                    showGenLinkBtn(generateLinkBtnParam, viewLinkBtnParam)
                    loadingScreen.style.display = "none"

                } else if (roleName == 'Customer Relationship Manager' || roleName == 'General Manager' || roleName == 'Administrator' || roleName == 'Deputy Bodyshop Manager') {

                    if (generateLinkBtnParam == "show") {

                        showGenLinkBtn(generateLinkBtnParam, viewLinkBtnParam)
                        loadingScreen.style.display = "none"
                    } else {

                        showGenLinkBtn(generateLinkBtnParam, viewLinkBtnParam)
                        loadingScreen.style.display = "none"
                    }

                } else if (roleName == '') {

                    generateLinkBtn.classList.add('hide')
                    viewLinkBtn.classList.add('hide')

                    loadingScreen.style.display = "none"
                }



            })
            .catch(error => {
                console.log('general API', error)
                errorScreen.classList.remove('hide')
            })



    } catch (error) {
        console.log('get data try catch', error);
        errorScreen.classList.remove('hide')
    }
}

function styleChangeBasedOnBranch(data) {

    if (data.Data.records[0].branchOfJob == "Abu Dhabi" || data.Data.records[0].branchOfJob == "Dubai") {

        navLogo.src = './assets/GE_Logo_white.png'
        errorLogo.src = './assets/GE_Logo.png'
        popupLogo.src = './assets/GE Logo_Horizontal Version white.png'
        footerLogo.src = './assets/GE Logo_Horizontal Version white.png'
        footerElement.style.display = 'block'
        copyrightStatement.forEach(item => item.innerText = 'German Experts Car Maintenance LLC')


    } else if (data.Data.records[0].branchOfJob == "Experts Abu Dhabi" || data.Data.records[0].branchOfJob == "Experts Dubai") {

        navLogo.src = './assets/experts-white.png'
        errorLogo.src = './assets/logo.png'
        popupLogo.src = './assets/experts-white.png'
        footerLogo.src = './assets/experts-white.png'
        footerElement.style.display = 'none'
        copyrightStatement.forEach(item => item.innerText = 'Experts Car Maintenance LLC')
    }

}



function fetchInspectionImages(data) {
    try {

        fetch('data2.json')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }
                return res.json()
            })
            .then(data => {

                if (data.Message == "Get Technician Inspection List unsuccessfully") {
                    console.log('image API', data.Message);

                    if (data.Data[0].errors[0].message == "Token Expired") {
                        console.log('image API', data.Data[0].errors[0].message)
                        createNewAccessToken()

                    } else if (data.Data[0].message == "No records found") {

                        console.log('image API', data.Data[0].message)
                        imgLoading.classList.add('hide')
                        inspectionImgSection.style.display = "none"

                    }

                } else {

                    // imgLoading.classList.add('hide')
                    populateImages(data.Response)

                }

            })
            .catch(error => {
                console.log('image API fetch catch', error)
                imgLoading.classList.add('hide')
                inspectionImgSection.style.display = "none"
            })



        // fetch('https://geapps.germanexperts.ae:7007/api/crmservicegetaccesstokenByStatus/Active/1')
        //     .then(res => {
        //         if (!res.ok) {
        //             throw new Error(`HTTP error! Status: ${res.status}`);
        //         }
        //         return res.json()
        //     })
        //     .then(accessdata => {

        //         if (accessdata.length == 0 && Array.isArray(accessdata)) {
        //             console.log('token empty array');
        //             createNewAccessToken()
        //             return
        //         }

        //         accessToken = accessdata[0].crm_accesstoken

        //         fetch(`https://geapps.germanexperts.ae:7007/api/generalinspdocumentimagesnew/${data.Data.records[0].doc__Name}`, {
        //             method: 'GET',
        //             headers: {
        //                 'Content-Type': 'application/json',
        //                 'access_token': accessToken
        //             }
        //         })
        //             .then(res => {
        //                 if (!res.ok) {
        //                     throw new Error(`HTTP error! Status: ${res.status}`);
        //                 }
        //                 return res.json()
        //             })
        //             .then(data => {
        //                 console.log(data);

        //                 if (data.Message == "Get Technician Inspection List unsuccessfully") {
        //                     console.log('image API', data.Message);

        //                     if (data.Data[0].errors[0].message == "Token Expired") {
        //                         console.log('image API', data.Data[0].errors[0].message)
        //                         createNewAccessToken()

        //                     } else if (data.Data[0].message == "No records found") {

        //                         console.log('image API', data.Data[0].message)
        //                         imgLoading.classList.add('hide')
        //                         inspectionImgSection.style.display = "none"

        //                     }

        //                 } else {

        //                     // imgLoading.classList.add('hide')
        //                     populateImages(data.Response)

        //                 }

        //             })
        //             .catch(error => {
        //                 console.log('image API fetch catch', error)
        //                 imgLoading.classList.add('hide')
        //                 inspectionImgSection.style.display = "none"
        //             })

        // })
        // .catch(error => {
        //     console.log('get access token fetch err', error);
        //     errorScreen.classList.remove('hide')
        // })

    } catch (error) {
        console.log('image API try catch', error)
        imgLoading.classList.add('hide')
        inspectionImgSection.style.display = "none"
    }
}


function showGenLinkBtn(gbtnParam, vbtnParam) {

    if (gbtnParam == "show") {
        generateLinkBtn.classList.remove('hide')
    } else {
        generateLinkBtn.classList.add('hide')
    }

    if (vbtnParam == "show") {
        viewLinkBtn.classList.remove('hide')
    } else {
        viewLinkBtn.classList.add('hide')
    }
}

function checkBtnFlag() {
    if (btnFlag) {
        generateLinkBtn.classList.add('hide')
    } else {
        generateLinkBtn.classList.remove('hide')
    }
}



generateLinkBtn.addEventListener('click', () => {
    const currentUrl = new URL(window.location.href);
    const urlString = String(currentUrl)

    var urlParts = urlString.split('?');

    var baseUrl = urlParts[0];
    var params = urlParts[1].split('&');

    var updatedParams = params.filter(function (param) {
        var paramParts = param.split('=');
        return paramParts[0] !== "glbtn" && paramParts[0] !== "r" && paramParts[0] !== "rs";
    });

    var updatedUrl = baseUrl + '?' + updatedParams.join('&');

    if (roleName != 'Service Advisor') {
        customerLink.innerHTML = updatedUrl
    }

    popUpModal.classList.remove('hide')

    updateurl(Tid, updatedUrl)

    btnFlag = true
    checkBtnFlag()

})

viewLinkBtn.addEventListener('click', () => {
    const currentUrl = new URL(window.location.href);
    const urlString = String(currentUrl)

    var urlParts = urlString.split('?');

    var baseUrl = urlParts[0];
    var params = urlParts[1].split('&');

    var updatedParams = params.filter(function (param) {
        var paramParts = param.split('=');
        return paramParts[0] !== "glbtn" && paramParts[0] !== "vlbtn";
    });

    var updatedUrl = baseUrl + '?' + updatedParams.join('&');

    customerLink.innerHTML = updatedUrl
    popUpModal.classList.remove('hide')

})



modalCloseBtn.addEventListener('click', () => {
    popUpModal.classList.add('hide')
})

function createNewAccessToken() {

    try {

        fetch('https://geapps.germanexperts.ae:7007/api/crmservicegeneralcrmapiaccesstoken', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'apiKey': 'a4db08b7-5729-4ba9-8c08-f2df493465a1'
            },
            body: JSON.stringify({
                username: 'geappadmin.a',
                password: 'admin123'
            })
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }
                return res.json()
            })
            .then(data => {
                let crmAccessToken = data.Data.accessToken
                let crmRefreshToken = data.Data.refreshToken

                fetch('https://geapps.germanexperts.ae:7007/api/crmserviceaccesstoken', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        app_id: "1",
                        crm_accesstoken: crmAccessToken,
                        crm_refreshtoken: crmRefreshToken,
                        status: "1"
                    })
                })
                    .then(res => {
                        if (!res.ok) {
                            throw new Error(`HTTP error! Status: ${res.status}`);
                        }
                        return res.json()
                    })
                    .then(data => {

                        fetch('https://geapps.germanexperts.ae:7007/api/crmserviceaccesstokenInactive/1', {
                            method: "POST",
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                status: "0"
                            })
                        })
                            .then(res => {
                                if (!res.ok) {
                                    throw new Error(`HTTP error! Status: ${res.status}`);
                                }
                                return res.json()
                            })
                            .then(data => {

                                // ? calling the fetch access token again
                                starter()
                            })
                            .catch(error => {
                                console.log('changing status of old access token fetch error', error);
                                errorScreen.classList.remove('hide')
                            })

                    })
                    .catch(error => {
                        console.log('updating new access token fetch error', error);
                        errorScreen.classList.remove('hide')
                    })

            })
            .catch(error => {
                console.log('creating new access token fetch error', error);
                errorScreen.classList.remove('hide')
            })
    } catch (error) {
        console.log('creating new access token try catch error', error);
        errorScreen.classList.remove('hide')
    }
}

// Modify the populateBanner function to also change the background image
function populateBanner() {
    const bgElement = document.querySelector('.bg');

    if (inspectionType == "NI") {
        bannerHeading.innerHTML = `
            <p>Technical</p>
            <p>Inspection</p>
            <p>Report</p>
        `;
        bgElement.style.backgroundImage = "url('./assets/hand-holding-gear-cog-machine.jpg')";
    } else if (inspectionType == "BSMI") {
        bannerHeading.innerHTML = `
            <p>Body Shop &</p>
            <p>Mechanical</p>
            <p>Inspection</p>
            <p>Report</p>
        `;
        bgElement.style.backgroundImage = "url('./assets/body-shop-mechanical-bg.jpg')";
    } else if (inspectionType == "BSI") {
        bannerHeading.innerHTML = `
            <p>Body Shop</p>
            <p>Inspection</p>
            <p>Report</p>
        `;
        bgElement.style.backgroundImage = "url('./assets/body-shop-mechanical-bg.jpg')";
    } else {
        bannerHeading.innerHTML = `
            <p>Warranty</p>
            <p>Pre-purchase</p>
            <p>Report</p>
        `;
        bgElement.style.backgroundImage = "url('./assets/hand-holding-gear-cog-machine.jpg')";
    }

    // Fallback if the image doesn't load
    const img = new Image();
    img.onerror = function () {
        bgElement.style.backgroundImage = "url('./assets/hand-holding-gear-cog-machine.jpg')";
    };
    img.src = bgElement.style.backgroundImage.replace(/url\(['"](.+)['"]\)/, '$1');
}


function populateCustomerInfo(data) {

    let dataObj = data.Data.records[0]

    let infoHtml = ``

    if (dataObj.branchOfJob == "Abu Dhabi" || dataObj.branchOfJob == "Dubai") {

        infoHtml = `
        <div class="customer-info">
            <p>Dear Mr/Mrs <span class="bld">${dataObj.customer__name}</span>, German Experts has created this personalized
            and extensive Inspection report for your <span class="bld">${dataObj.vehicleMake__name}</span> vehicle with plate no: <span class="bld">${dataObj.plate_no}</span> and
            chassis no: <span class="bld">${dataObj.chassis_no}.</span></p>
    
            <p>Your vehicle was taken under the job request number <span class="bld">${dataObj.sName}</span> on <span class="bld">${dataObj.createdDate.split(" ")[0]}</span> by service advisor <span class="bld">${dataObj.service_advisor}</span>, phone: <a href="tel:971${removeLeadingZero(dataObj.serviceAdvisorPhone)}">+971${removeLeadingZero(dataObj.serviceAdvisorPhone)}</a> , <a href="https://api.whatsapp.com/send?phone=971${removeLeadingZero(dataObj.serviceAdvisorPhone)}">whatsapp</a>.
            </p>
        </div>
        `


    } else if (dataObj.branchOfJob == "Experts Abu Dhabi" || dataObj.branchOfJob == "Experts Dubai") {

        infoHtml = `
    <div class="customer-info">
        <p>Dear Mr/Mrs <span class="bld">${dataObj.customer__name}</span>, Experts has created this personalized
        and extensive Inspection report for your <span class="bld">${dataObj.vehicleMake__name}</span> vehicle with plate no: <span class="bld">${dataObj.plate_no}</span> and
        chassis no: <span class="bld">${dataObj.chassis_no}.</span></p>

        <p>Your vehicle was taken under the job request number <span class="bld">${dataObj.sName}</span> on <span class="bld">${dataObj.createdDate.split(" ")[0]}</span> by service advisor <span class="bld">${dataObj.service_advisor}</span>, phone: <a href="tel:971${removeLeadingZero(dataObj.serviceAdvisorPhone)}">+971${removeLeadingZero(dataObj.serviceAdvisorPhone)}</a> , <a href="https://api.whatsapp.com/send?phone=971${removeLeadingZero(dataObj.serviceAdvisorPhone)}">whatsapp</a>.
        </p>
    </div>
    `

    }





    customerInfoOut.innerHTML = infoHtml


}

function removeLeadingZero(str) {
    if (str.charAt(0) == '0') {
        return str.slice(1);
    }
    return str;
}


function checklistIcons(iconValue, brake = false, brakeCondition = 'NA') {

    if (iconValue == 'OK') {
        return '<td><img src="./assets/correct.png" alt=""></td>'
    } else if (iconValue == 'NOK') {
        return '<td><img src="./assets/failed.png" alt=""></td>'
    } else if (iconValue == 'CHK') {
        return '<td><img src="./assets/warning.png" alt=""></td>'
    } else if (iconValue == 'NA') {
        return '<td><img src="./assets/na-1.png" alt=""></td>'
    } else {
        if (brake) {
            if (brakeCondition == 'NOK') {
                return `<td><p style="color:red;">${iconValue}</p></td>`
            } else {
                return `<td><p">${iconValue}</p></td>`
            }

        } else {
            return `<td><p>${iconValue}</p></td>`
        }
    }
}

function extractNumberFromString(str) {
    // Find the position of "mm" in the string
    var index = str.indexOf("mm");
    if (index !== -1) {
        // Extract the substring containing numbers
        var numberString = str.substring(0, index);
        // Convert the substring to a number
        var number = parseFloat(numberString);
        // Return the extracted number
        return number;
    } else {
        // If "mm" is not found, return null or handle the case as per your requirement
        return null;
    }
}


function populateChecklist(data) {
    let dataObj = data.Data
    let records = dataObj.records[0]
    let engineCompartment = dataObj.enginecompartment_[0]
    let transmission = dataObj.transmissions_[0]
    let driveTrain = dataObj.driveTrain_[0]
    let brakeSystem = dataObj.brakeSystem_[0]
    let steering = dataObj.steering_[0]
    let interior = dataObj.interior_[0]
    let obdDiagnostic = dataObj.obdDiagnosticCodes_[0]
    let exterior = dataObj.exterior_[0]
    let electricalControls = dataObj.electricalControls_[0]
    let wheelsAndTyres = dataObj.wheelsAndTyres_[0]
    let underbody = dataObj.underBody_[0]
    let frontSuspension = dataObj.frontSuspension_[0]
    let rearSuspension = dataObj.rearSuspension_[0]
    let fuelSystem = dataObj.fuelSystem_[0]
    let exhaustSystem = dataObj.exhaustSystem_[0]
    let suspension = dataObj.suspension_[0]
    let acSystem = dataObj.acSystem_[0]
    let roadTest = dataObj.roadTestNFinalChecks_[0]

    let bodyshop = dataObj.bodyShopInspection_[0]

    function customTemplateLogic(...args) {
        const firstArg = args[0];
        const restArgs = args.slice(1);

        for (let i = 0; i < restArgs.length; i++) {
            if (restArgs[i] === firstArg) {
                return '';
            }
        }

        return 'hide';
    }

    function checklistTemplate(type) {

        return `<button class="accordion clicked active ${customTemplateLogic(type, 'NI', 'BSMI', 'two')}"><img class="accordion-icon" src="./assets/checklist-icons/service checklist.png">SERVICE CHECKLIST<span class="arrow">▼</span></button>
    <div class="panel ${customTemplateLogic(type, 'NI', 'BSMI', 'two')} show" >
        <div class="card-wrapper">
            <div class="card">
                <div class="card-img-wrapper">
                    <img src="./assets/service.jpg" alt="">
                </div>
                
                <div class="card-data">

                    <table class="responsive-table">
                        <tr>
                            <td class="checklist-label">Engine Oil Level</td>
                            ${checklistIcons(engineCompartment.engine_oil)}
                        </tr>
                        <tr>
                            <td class="checklist-label">Transmission Oil Condition</td>
                            ${checklistIcons(transmission.transmission_oil_condition)}
                        </tr>
                        <tr>
                            <td class="checklist-label">Differential Oil Front Condition</td>
                            ${checklistIcons(driveTrain.differentiaL_OIL_CONDITION)}
                        </tr>
                        <tr>
                            <td class="checklist-label">Brake Fluid Level, Reservoir And Cap Check</td>
                            ${checklistIcons(brakeSystem.brakE_FLUID_LEVEL_RESERVOIR_N_CAP_CHECK)}
                        </tr>
                        <tr>
                            <td class="checklist-label">Transfer Case Oil Condition</td>
                            ${checklistIcons(driveTrain.transfeR_CASE_OIL_CONDITION)}
                        </tr>
                        <tr>
                            <td class="checklist-label">Filters And Spark Plugs</td>
                            ${checklistIcons(engineCompartment.filter_spark_plug)}
                        </tr>
                        <tr>
                            <td class="checklist-label">Battery Voltage</td>
                            ${checklistIcons(records.batteryAmp)}
                        </tr>
                        <tr>
                            <td class="checklist-label">Battery Production Date</td>
                            ${checklistIcons(records.batteryProduction)}
                        </tr>
                    </table>

                </div>
            </div>
        </div>
    </div>

    <button class="accordion ${customTemplateLogic(type, 'NI', 'BSMI', 'two')}"><img class="accordion-icon" src="./assets/checklist-icons/interior driver.png">INTERIOR-DRIVER POSITION<span class="arrow">►</span></button>
                <div class="panel ${customTemplateLogic(type, 'NI', 'BSMI', 'two')}">
                    <div class="card-wrapper">
                        <div class="card">
                            <div class="card-img-wrapper">
                                <img src="./assets/interiror driver.jpg" alt="">
                            </div>
                            
                            <div class="card-data">
    
                                <table class="responsive-table">
                                    <tr>
                                        <td class="checklist-label">Warning Lights ON(ESC,Airbag,MIL)</td>
                                        ${checklistIcons(interior.warninG_LIGHTS_ON_ESC_AIRBAG_MIL)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Stored Messages On-Board Computer</td>
                                        ${checklistIcons(obdDiagnostic.storeD_MESSAGES_ON_BOARD_COMPUTER)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">WindScreen Wiper Blade and Washers Control System</td>
                                        ${checklistIcons(interior.winD_SCREEN_WIPER_BLADE_WASHER_CONTROL_SYSTEM)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Electric Parking Brake Functionality</td>
                                        ${checklistIcons(brakeSystem.parkinG_BRAKE_FUNCTIONALITY)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Horn Functionality (All Areas Of Pad)</td>
                                        ${checklistIcons(records.hornFunctionalityAllAreasOfPadName)}
                                    </tr>
                                </table>
    
                            </div>
                        </div>
                    </div>
                </div>

                <button class="accordion ${customTemplateLogic(type, 'NI', 'BSMI', 'two')}"><img class="accordion-icon" src="./assets/checklist-icons/exterior 1.png">EXTERIOR<span class="arrow">►</span></button>
                <div class="panel ${customTemplateLogic(type, 'NI', 'BSMI', 'two')}">
                    <div class="card-wrapper">
                        <div class="card">
                            <div class="card-img-wrapper">
                                <img src="./assets/exterior.jpg" alt="">
                            </div>
                            
                            <div class="card-data">
    
                                <table class="responsive-table">
                                    <tr>
                                        <td class="checklist-label">All Lights Condition</td>
                                        ${checklistIcons(exterior.alL_LIGHTS_PHYSICAL_CONDITION)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">All Lights Function</td>
                                        ${checklistIcons(electricalControls.alL_LIGHTS_FUNCTION)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Windscreen Glass</td>
                                        ${checklistIcons(exterior.windscreeN_GLASS)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">All Side Mirror Housing And Glass</td>
                                        ${checklistIcons(exterior.alL_SIDE_MIRROR_HOUSING_AND_GLASS)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Fuel Lid Correctly Locking And Unlocking</td>
                                        ${checklistIcons(exterior.fueL_LID_CORRECTLY_LOCKING_AND_UNLOCKING)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Sunroof Glass And Seals</td>
                                        ${checklistIcons(records.sunroofGlassAndSealsTestForLeaksName)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Convertible Soft Top Condition</td>
                                        ${checklistIcons(exterior.convertiblE_SOFT_TOP_CONDITION)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'NI')}">
                                        <td class="checklist-label">Automatic Trunk Lid Opening And Closing</td>
                                        ${checklistIcons(exterior.automatiC_TRUNK_LID_OPENING_0AND_CLOSING_FUNCTION)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'NI')}">
                                        <td class="checklist-label">Checking For Body Modification</td>
                                        ${checklistIcons(exterior.checkinG_FOR_BODY_MODIFICATIONS)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">All Door Handle Open Close Functionality (With door lock ON/OFF)</td>
                                        ${checklistIcons(exterior.alL_DOOR_HANDLE_OPEN_CLOSE_FUNCTIONALITY)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Emergency equipment kit</td>
                                        ${checklistIcons(exterior.emergencY_EQUIPMENT_REFLECTIVE_JACKE_WARNING_TRIANGLE_FIRST_AID_KIT)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Spare Wheel/Tyre Fit Kit</td>
                                        ${checklistIcons(wheelsAndTyres.sparE_WHEEL_PRESENCE_CONDITION)}
                                    </tr>

                                </table>
    
                            </div>
                        </div>
                    </div>
                </div>

                <button class="accordion ${customTemplateLogic(type, 'NI', 'BSMI', 'two')}"><img class="accordion-icon" src="./assets/checklist-icons/wheel 1.png">WHEELS AND TYRES<span class="arrow">►</span></button>
                <div class="panel ${customTemplateLogic(type, 'NI', 'BSMI', 'two')}">
                    <div class="card-wrapper">
                        <div class="card">
                            <div class="card-img-wrapper">
                                <img src="./assets/wheel3.png" alt="">
                            </div>
                            
                            <div class="card-data">
    
                                <table class="responsive-table">
                                    <tr>
                                        <td class="checklist-label">Tyre Front Left Thread Depth/Evenness & Condition</td>
                                        ${checklistIcons(wheelsAndTyres.tyrE_FRONT_LEFT_THREAD_DEPTH_EVENNESS)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Tyre Front Right Thread Depth/Evenness & Condition</td>
                                        ${checklistIcons(wheelsAndTyres.tyrE_FRONT_RIGHT_THREAD_DEPTH_EVENNESS)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Tyre Rear Left Thread Depth/Evenness & Condition</td>
                                        ${checklistIcons(wheelsAndTyres.tyrE_REAR_LEFT_THREAD_DEPTH_EVENNESS)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Tyre Rear Right Thread Depth/Evenness & Condition</td>
                                        ${checklistIcons(wheelsAndTyres.tyrE_REAR_RIGHT_THREAD_DEPTH_EVENNESS)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Tyre Front Left Pressure Measure Gauge</td>
                                        ${checklistIcons(records.tyreFrontLeftPressureMeasureGauge)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Tyre Rear Left Pressure Measure Gauge</td>
                                        ${checklistIcons(records.tyreRearLeftPressureMeasureGuage)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Tyre Front Right Pressure Measure Gauge</td>
                                        ${checklistIcons(records.tyreFrontRightPressureMeasureGauge)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Tyre Rear Right Pressure Measure Gauge</td>
                                        ${checklistIcons(records.tyreRearRightPressureMeasureGauge)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">All Rim Condition</td>
                                        ${checklistIcons(wheelsAndTyres.alL_RIM_CONDITION)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">All Rim Wheel Bearing Condition(Play/Noise)</td>
                                        ${checklistIcons(wheelsAndTyres.alL_WHEEL_BEARINGS_CONDITION)}
                                    </tr>
                                </table>
    
                            </div>
                        </div>
                    </div>
                </div>

                <button class="accordion ${customTemplateLogic(type, 'NI', 'BSMI', 'two')}"><img class="accordion-icon" src="./assets/checklist-icons/brakes 1.png">BRAKES<span class="arrow">►</span></button>
                <div class="panel ${customTemplateLogic(type, 'NI', 'BSMI', 'two')}">
                    <div class="card-wrapper">
                        <div class="card">
                            <div class="card-img-wrapper">
                                <img src="./assets/brakes.jpg" alt="">
                            </div>
                            
                            <div class="card-data">
    
                                <table class="responsive-table">
                                    <tr class="${customTemplateLogic(type, 'NI', 'BSMI')}">
                                        <td class="checklist-label">Front Brake Pad Thickness</td>
                                        ${checklistIcons(records.flBrakePadpercent, true, brakeSystem.fronT_BRAKE_PAD_THICKNESS)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">Front Brake Pad Thickness</td>
                                        ${checklistIcons(records.flBrakePadpercent, true)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'NI', 'BSMI')}">
                                        <td class="checklist-label">Rear Brake Pad Thickness</td>
                                        ${checklistIcons(records.rlBrakePadThicknessPerce, true, brakeSystem.reaR_BRAKE_PAD_THICKNESS)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">Rear Brake Pad Thickness</td>
                                        ${checklistIcons(records.rlBrakePadThicknessPerce, true)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Front Brake Disc Actual Thickness</td>
                                        ${checklistIcons(records.flBrakeDiscActualThickness)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Front Brake Disc Wear Limit</td>
                                        ${checklistIcons(records.flBrakeDiscRecommendedThickness)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Rear Brake Disc Actual Thickness</td>
                                        ${checklistIcons(records.frBrakeDiscActualThickness)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Rear Brake Disc Wear Limit</td>
                                        ${checklistIcons(records.rlBrakeDiscRecommendedThickness)}
                                    </tr>
                                </table>
    
                            </div>
                        </div>
                    </div>
                </div>

                <button class="accordion ${customTemplateLogic(type, 'NI', 'BSMI', 'two')}"><img class="accordion-icon" src="./assets/checklist-icons/engine 1.png">ENGINE COMPARTMENT<span class="arrow">►</span></button>
                <div class="panel ${customTemplateLogic(type, 'NI', 'BSMI', 'two')}">
                    <div class="card-wrapper">
                        <div class="card">
                            <div class="card-img-wrapper">
                                <img src="./assets/engine compartment.jpg" alt="">
                            </div>
                            
                            <div class="card-data">
    
                                <table class="responsive-table">
                                    <tr>
                                        <td class="checklist-label">Check Bonnet Lock, Switch, Cable, Shock, Rear Lid </td>
                                        ${checklistIcons(engineCompartment.chkBontLock_switch_cable)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Check Power Steering Pump, Hoses Leaks, Fluid Level And Reservoir Cap</td>
                                        ${checklistIcons(engineCompartment.chk_power_steering_pumb_hoses_for_leakage)}
                                    </tr>

                                    <tr>
                                        <td class="checklist-label">All Hoses (Cracks Damages Leaks)</td>
                                        ${checklistIcons(engineCompartment.all_hoses)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Accessory Belts(Condition Tension)</td>
                                        ${checklistIcons(engineCompartment.accesory_belt)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Check Coolant Level and Condition</td>
                                        ${checklistIcons(records.checkCoolantPressureTestName)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Engine Mount Check</td>
                                        ${checklistIcons(engineCompartment.engine_mount_check)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Transmission Mount Check</td>
                                        ${checklistIcons(transmission.transmission_mount_check)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Differential Oil Rear Condition</td>
                                        ${checklistIcons(driveTrain.differentiaL_OIL_REAR_CONDITION)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Check Differential Front/Rear Mounts</td>
                                        ${checklistIcons(driveTrain.checK_DIFFERENTIAL_FRONT_REAR_MOUNTS)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">Engine Performance At Idle</td>
                                        ${checklistIcons(engineCompartment.engine_perfomance_at_idle)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">Engine Oil Level Condition</td>
                                        ${checklistIcons(engineCompartment.engine_oillevel_n_condition)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">AC System Components Pipes Condenser etc</td>
                                        ${checklistIcons(engineCompartment.ac_system_Component)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">Fuel System, Pump, Lines, Rails, Injectors Condition</td>
                                        ${checklistIcons(fuelSystem.fuel_system_pump_lines_rails_injectors_condition)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">Radiator Fan Function And Condition</td>
                                        ${checklistIcons(engineCompartment.radfan_fun_n_cond)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">Coolant System</td>
                                        ${checklistIcons(engineCompartment.coolent_pump_ex_cond)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">VBelt Idler Pulleys Tensioner Condition</td>
                                        ${checklistIcons(engineCompartment.vbelt_idlerpullys_tension_cond)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Hydraulic Suspension Pump Function, Oil Level Condition</td>
                                        ${checklistIcons(engineCompartment.hydraulic_suspension_pump_fun_n_condition)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">Wiring Harness Overall Condition</td>
                                        ${checklistIcons(engineCompartment.wiring_harnes_overall_cond)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">Compression Test Need To Add Specified Values</td>
                                        ${checklistIcons(engineCompartment.compress_test)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">Engine Performance</td>
                                        ${checklistIcons(engineCompartment.engine_Condition)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">Engine Fault</td>
                                        ${checklistIcons(engineCompartment.engine_Fault)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">Tubro And Super Charger Condition</td>
                                        ${checklistIcons(engineCompartment.turbo_n_Super_charger_condition)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">Engine Noise</td>
                                        ${checklistIcons(engineCompartment.engine_noise)}
                                    </tr>
                                </table>
    
                            </div>
                        </div>
                    </div>
                </div>

                <button class="accordion ${customTemplateLogic(type, 'NI', 'BSMI', 'two')}"><img class="accordion-icon" src="./assets/checklist-icons/interior 1.png">INTERIOR<span class="arrow">►</span></button>
                <div class="panel ${customTemplateLogic(type, 'NI', 'BSMI', 'two')}">
                    <div class="card-wrapper">
                        <div class="card">
                            <div class="card-img-wrapper">
                                <img src="./assets/interior.jpg" alt="">
                            </div>
                            
                            <div class="card-data">
    
                                <table class="responsive-table">
                                    <tr>
                                        <td class="checklist-label">All Seat Adjustment and Functionality</td>
                                        ${checklistIcons(electricalControls.alL_SEAT_ADJUSTMENT_FUNCTIONALITY)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">All Seat Belt Condition and Functionality</td>
                                        ${checklistIcons(interior.alL_SEAT_BELT_CONDITION_FUNCTIONALITY)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">Service Due Date Remark Box</td>
                                        ${checklistIcons(interior.servicE_DUE_DATA_REMARK_BOX)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">Steering Wheel Adjustment Function Condition</td>
                                        ${checklistIcons(electricalControls.steerinG_WHEEL_ADJUSTMENT_FUNCTION_CONDITION)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">Interior Light Ambient Lights Function And Condition</td>
                                        ${checklistIcons(electricalControls.interioR_LIGHT_AMBIENT_LIGHTS_FUNCTION_AND_CONDITIONN)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">Infotainment System Function And Condition</td>
                                        ${checklistIcons(electricalControls.infotainmenT_SYSTEM_FUNCTION_CONDITION)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">Child Lock Function</td>
                                        ${checklistIcons(interior.chilD_LOCK_FUNCTION)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">Start Stop Button</td>
                                        ${checklistIcons(interior.startinG_FUNCTION)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">Bonnet Release Handle Function And Condition</td>
                                        ${checklistIcons(interior.bonneT_RELEASE_HANDLE_FUNCTION_AND_CONDITION)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">Power Windows Windows Curtains Function And Condition</td>
                                        ${checklistIcons(electricalControls.poweR_WINDOWS_WINDOWS_CURTAINS_FUNCTION_AND_CONDITION)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">Rear Sunshade Curtain Function And Condition</td>
                                        ${checklistIcons(interior.reaR_SUNSHADE_CURTAIN_FUNCTION_AND_CONDITION)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">No Unauthorized Modification Found</td>
                                        ${checklistIcons(interior.nO_UNAUTHORIZED_MODIFICATION_FOUND)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">Checking If Mileage Modified</td>
                                        ${checklistIcons(obdDiagnostic.checkinG_IF_MILEAGE_MODIFIED)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">AC Performance</td>
                                        ${checklistIcons(records.acPerfomanceName)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Interior Electronics And System Functionality</td>
                                        ${checklistIcons(records.infotainmentSystemFunctionality)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Switches Condition</td>
                                        ${checklistIcons(records.switchesConditionName)}
                                    </tr>
                                    
                                    
                                </table>
    
                            </div>
                        </div>
                    </div>
                </div>

                <button class="accordion last-acc ${customTemplateLogic(type, 'NI', 'BSMI', 'two')}"><img class="accordion-icon" src="./assets/checklist-icons/underbody 1.png">UNDER BODY<span class="arrow">►</span></button>
                <div class="panel ${customTemplateLogic(type, 'NI', 'BSMI', 'two')}">
                    <div class="card-wrapper">
                        <div class="card">
                            <div class="card-img-wrapper">
                                <img src="./assets/underbody 2.jpg" alt="">
                            </div>
                            
                            <div class="card-data">
    
                                <table class="responsive-table">
                                    <tr>
                                        <td class="checklist-label">Signs Of Oil Leaks</td>
                                        ${checklistIcons(underbody.signS_OF_OIL_LEAKS)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Signs Of Coolant Leaks</td>
                                        ${checklistIcons(underbody.signS_OF_COOLANT_LEAKS)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Front Sub Frame Condition</td>
                                        ${checklistIcons(frontSuspension.fronT_SUB_FRAME_FIXING_CONDITION)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Engine Mounts(Bottom Area)</td>
                                        ${checklistIcons(records.engineMountcheckName)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Front Suspension: Struts, Shocks and Spring</td>
                                        ${checklistIcons(frontSuspension.fronT_SUSPENSION_STRUTS_SOCKS_N_SPRING)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Front Suspension :Sway Bars/Links/Bushings</td>
                                        ${checklistIcons(frontSuspension.fronT_SUSPENSION_SWAY_BARS_LINKS_BUSHINGS)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Steering Arms,Rack and Boots Condition</td>
                                        ${checklistIcons(steering.steerinG_ARMS_RACK_AND_BOOTS_INTEGRITY_AND_LEAK_CHECK)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Rear Sub Frame Condition</td>
                                        ${checklistIcons(rearSuspension.reaR_SUB_FRAME_FIXING_CONDITION)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Rear Suspension: Structs, Shocks and Springs</td>
                                        ${checklistIcons(rearSuspension.reaR_SUSPENSION_STRUCTS_SHOCKS_AND_SPRINGS)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Rear Suspension :Sway Bars/Links/Bushings</td>
                                        ${checklistIcons(rearSuspension.reaR_SUSPENSION_SWAY_BARS_LINKS_BUSHINGS)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">CV Joints/Boots</td>
                                        ${checklistIcons(driveTrain.cV_JOINTS_BOOTS)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Bottom Of Front And Rear Bumpers (Visual Damage)</td>
                                        ${checklistIcons(underbody.bottoM_OF_FRONT_AND_REAR_BUMPERS_VISUAL_DAMAGE)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">UnderBody Covers And Heat Shields Condition</td>
                                        ${checklistIcons(underbody.underbodY_COVERS_AND_HEAT_SHIELDS_FIXING_CONDITION)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Fuel Tank And Fuel Lines Condition</td>
                                        ${checklistIcons(fuelSystem.fuel_Tank_Fuel_Lines_Condition)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Exhaust System Condition</td>
                                        ${checklistIcons(exhaustSystem.exhausT_SYSTEM_CONDITION)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">Transmission Housing Condition</td>
                                        ${checklistIcons(transmission.transmission_housing_condition)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">Differential Locks Function And Condition</td>
                                        ${checklistIcons(driveTrain.differentiaL_LOCKS_FUNCTION_AND_CONDITION)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">Brake Lines, Brake, Caliper Condition</td>
                                        ${checklistIcons(brakeSystem.brakE_LINES_BRAKE_CALIPER_CONDITION)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">Air Suspension Compressor & Suspension Valve Block Function And Condition</td>
                                        ${checklistIcons(suspension.aiR_SUSPENSION_COMPRESSOR_FUNCTION_CONDITION)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">Air Hydraulic Suspension Lines Condition</td>
                                        ${checklistIcons(suspension.aiR_HYDRAULIC_SUSPENSION_LINES_CONDITION)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">All Tires Have The Same Brand</td>
                                        ${checklistIcons(wheelsAndTyres.alL_TIRES_HAVE_THE_SAME_BRAND)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">Wheel Housing Covers Condition</td>
                                        ${checklistIcons(underbody.wheeL_HOUSING_COVERS_CONDITION)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">Chassis Condition</td>
                                        ${checklistIcons(underbody.chassiS_CONDITION)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">Transmission Performance</td>
                                        ${checklistIcons(transmission.transmission_condition)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">Transmission Fault</td>
                                        ${checklistIcons(transmission.transmission_faults)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">Center Support Bearing Automatic Transmission</td>
                                        ${checklistIcons(driveTrain.centeR_SUPPORT_BEARING_AUTOMATIC_TRANSMISSION)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">Any Modification On Exhaust</td>
                                        ${checklistIcons(exhaustSystem.exhausT_MODIFIED)}
                                    </tr>
                                    <tr class="${customTemplateLogic(type, 'two')}">
                                        <td class="checklist-label">Exhaust Flap</td>
                                        ${checklistIcons(exhaustSystem.exhausT_FLAP)}
                                    </tr>
                                </table>
    
                            </div>
                        </div>
                    </div>
                </div>

                <button class="accordion ${customTemplateLogic(type, 'two')}"><img class="accordion-icon" src="./assets/checklist-icons/ac 1.png">AC SYSTEM<span class="arrow">►</span></button>
                <div class="panel ${customTemplateLogic(type, 'two')}">
                    <div class="card-wrapper">
                        <div class="card">
                            <div class="card-img-wrapper">
                                <img src="./assets/ac.jpg" alt="">
                            </div>
                            
                            <div class="card-data">
    
                                <table class="responsive-table">
                                    <tr>
                                        <td class="checklist-label">AC Gas Quantity</td>
                                        ${checklistIcons(acSystem.acgasquantity)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">AC Gas Quality</td>
                                        ${checklistIcons(acSystem.acgasquality)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">AC Compressor Condition</td>
                                        ${checklistIcons(acSystem.accomprossercondition)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Air Control Unit Functioning And Condition</td>
                                        ${checklistIcons(acSystem.accontrolunitfunction)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">AC Blower</td>
                                        ${checklistIcons(acSystem.acblower)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">AC Fault</td>
                                        ${checklistIcons(acSystem.acfault)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">AC Vents, AC Flaps</td>
                                        ${checklistIcons(acSystem.acconditioningcomponents)}
                                    </tr>
                                    
                                </table>
    
                            </div>
                        </div>
                    </div>
                </div>

                <button class="accordion ${customTemplateLogic(type, 'two')}"><img class="accordion-icon" src="./assets/checklist-icons/road test.png">ROAD TEST AND FINAL CHECK<span class="arrow">►</span></button>
                <div class="panel ${customTemplateLogic(type, 'two')}">
                    <div class="card-wrapper">
                        <div class="card">
                            <div class="card-img-wrapper">
                                <img src="./assets/road test.jpg" alt="">
                            </div>
                            
                            <div class="card-data">
    
                                <table class="responsive-table">
                                    <tr>
                                        <td class="checklist-label">AC Performance Road Check</td>
                                        ${checklistIcons(roadTest.acperfomanceroadtest)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Cruise Control, Lane Change Assist Function</td>
                                        ${checklistIcons(roadTest.instrumentsncontrols)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">4WD Operation</td>
                                        ${checklistIcons(roadTest.fwdoperation)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Brake Operation</td>
                                        ${checklistIcons(roadTest.brakeoperation)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Engine Performance</td>
                                        ${checklistIcons(roadTest.engineperformance)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Transmission Perfromance</td>
                                        ${checklistIcons(roadTest.transmissionperformance)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Suspension Performance</td>
                                        ${checklistIcons(roadTest.suspensionperformance)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Driver Assistance System</td>
                                        ${checklistIcons(roadTest.driverassistancesystems)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Drivability Condition</td>
                                        ${checklistIcons(roadTest.drivabilitycondition)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Tires</td>
                                        ${checklistIcons(roadTest.tires)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Any Sign On The Cluster</td>
                                        ${checklistIcons(records.anySignOntheClusterName)}
                                    </tr>
                                    
                                </table>
    
                            </div>
                        </div>
                    </div>
                </div>

                <button class="accordion ${customTemplateLogic(type, 'two')}"><img class="accordion-icon" src="./assets/checklist-icons/compression.png">COMPRESSION TEST<span class="arrow">►</span></button>
                <div class="panel ${customTemplateLogic(type, 'two')}">
                    <div class="card-wrapper">
                        <div class="card">
                            <div class="card-img-wrapper">
                                <img src="./assets/compression.jpg" alt="">
                            </div>
                            
                            <div class="card-data">
    
                                <table class="responsive-table">
                                    <tr>
                                        <td class="checklist-label">Compression Cylinder 1</td>
                                        ${checklistIcons(records.compressionCylinder1Name)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Compression Cylinder 2</td>
                                        ${checklistIcons(records.compressionCylinder2Name)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Compression Cylinder 3</td>
                                        ${checklistIcons(records.compressionCylinder3Name)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Compression Cylinder 4</td>
                                        ${checklistIcons(records.compressionCylinder4Name)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Compression Cylinder 5</td>
                                        ${checklistIcons(records.compressionCylinder5Name)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Compression Cylinder 6</td>
                                        ${checklistIcons(records.compressionCylinder6Name)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Compression Cylinder 7</td>
                                        ${checklistIcons(records.compressionCylinder7Name)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Compression Cylinder 8</td>
                                        ${checklistIcons(records.compressionCylinder8Name)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Compression Cylinder 9</td>
                                        ${checklistIcons(records.compressionCylinder9Name)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Compression Cylinder 10</td>
                                        ${checklistIcons(records.compressionCylinder10Name)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Compression Cylinder 11</td>
                                        ${checklistIcons(records.compressionCylinder11Name)}
                                    </tr>
                                    <tr>
                                        <td class="checklist-label">Compression Cylinder 12</td>
                                        ${checklistIcons(records.compressionCylinder12Name)}
                                    </tr>
                                    
                                </table>
    
                            </div>
                        </div>
                    </div>
                </div>

                <button class="accordion last-acc ${customTemplateLogic(type, 'BSMI', 'BSI')}"><img class="accordion-icon" src="./assets/checklist-icons/body-shop.png">BODY SHOP<span class="arrow">►</span></button>
        <div class="panel ${customTemplateLogic(type, 'BSMI', 'BSI')}">
        <div class="card-wrapper">
            <div class="card">
                <div class="card-img-wrapper">
            
                </div>
                
                <div class="card-data">

                    <table class="responsive-table">
                        <tr>
                            <td class="checklist-label">Front Bumper</td>
                            ${checklistIcons(bodyshop.front_Bumper)}
                        </tr>
                        <tr>
                            <td class="checklist-label">Bonnet</td>
                            ${checklistIcons(bodyshop.bonnet)}
                        </tr>
                        <tr>
                            <td class="checklist-label">Front Windscreen</td>
                            ${checklistIcons(bodyshop.front_Windscreen)}
                        </tr>
                        <tr>
                            <td class="checklist-label">A Pillar Right Side</td>
                            ${checklistIcons(bodyshop.a_Pillar_Right_Side)}
                        </tr>
                        <tr>
                            <td class="checklist-label">Front Right Fender</td>
                            ${checklistIcons(bodyshop.front_Right_Fender)}
                        </tr>
                        <tr>
                            <td class="checklist-label">Front Right Door</td>
                            ${checklistIcons(bodyshop.front_Right_Door)}
                        </tr>
                        <tr>
                            <td class="checklist-label">B Pillar Right Side</td>
                            ${checklistIcons(bodyshop.b_Pillar_Right_Side)}
                        </tr>
                        <tr>
                            <td class="checklist-label">Rear Right Door</td>
                            ${checklistIcons(bodyshop.rear_Right_Door)}
                        </tr>
                        <tr>
                            <td class="checklist-label">Running Board Right Side</td>
                            ${checklistIcons(bodyshop.running_Board_Right_Side)}
                        </tr>
                        <tr>
                            <td class="checklist-label">Rear Right Fender</td>
                            ${checklistIcons(bodyshop.rear_Right_Fender)}
                        </tr>
                        <tr>
                            <td class="checklist-label">Rear Bumper</td>
                            ${checklistIcons(bodyshop.rear_Bumper)}
                        </tr>
                        <tr>
                            <td class="checklist-label">Rear Panel </td>
                            ${checklistIcons(bodyshop.rear_Panel)}
                        </tr>
                        <tr>
                            <td class="checklist-label">Spare Wheel Well</td>
                            ${checklistIcons(bodyshop.spare_Wheel_Well)}
                        </tr>
                        <tr>
                            <td class="checklist-label">Bootlid</td>
                            ${checklistIcons(bodyshop.bootlid)}
                        </tr>
                        <tr>
                            <td class="checklist-label">Rear Windscreen</td>
                            ${checklistIcons(bodyshop.rear_Windscreen)}
                        </tr>
                        <tr>
                            <td class="checklist-label">Rear Left Fender</td>
                            ${checklistIcons(bodyshop.rear_Left_Fender)}
                        </tr>
                        <tr>
                            <td class="checklist-label">Running Board Left Side</td>
                            ${checklistIcons(bodyshop.running_Board_Left_Side)}
                        </tr>
                        <tr>
                            <td class="checklist-label">Rear Left Door</td>
                            ${checklistIcons(bodyshop.rear_Left_Door)}
                        </tr>
                        <tr>
                            <td class="checklist-label"> B Pillar Left Side </td>
                            ${checklistIcons(bodyshop.b_Pillar_Left_Side)}
                        </tr>
                        <tr>
                            <td class="checklist-label"> Front Left Door </td>
                            ${checklistIcons(bodyshop.front_Left_Door)}
                        </tr>
                        <tr>
                            <td class="checklist-label">A Pillar Left Side </td>
                            ${checklistIcons(bodyshop.a_Pillar_Left_Side)}
                        </tr>
                        <tr>
                            <td class="checklist-label">Front Left Fender </td>
                            ${checklistIcons(bodyshop.front_Left_Fender)}
                        </tr>
                        <tr>
                            <td class="checklist-label">Sun Roof Panel</td>
                            ${checklistIcons(bodyshop.sun_Roof__Panel)}
                        </tr>
                        <tr>
                            <td class="checklist-label">Panorama Roof Panel</td>
                            ${checklistIcons(bodyshop.panorama_Roof_Panel)}
                        </tr>


                        
                        <tr>
                            <td class="checklist-label">Underbody Condition</td>
                            ${checklistIcons(bodyshop.underbody_Condition)}
                        </tr>
                        <tr>
                            <td class="checklist-label">Wheel Rim Condition</td>
                            ${checklistIcons(bodyshop.wheel_Rim_Condition)}
                        </tr>
                        <tr>
                            <td class="checklist-label">Stored Messages Faults</td>
                            ${checklistIcons(bodyshop.stored_Messages_Faults)}
                        </tr>
                        <tr>
                            <td class="checklist-label">Headlights</td>
                            ${checklistIcons(bodyshop.headlights)}
                        </tr>
                        <tr>
                            <td class="checklist-label">Side Mirrors</td>
                            ${checklistIcons(bodyshop.side_Mirrors)}
                        </tr>
                        <tr>
                            <td class="checklist-label">Interiors Condition</td>
                            ${checklistIcons(bodyshop.interiors_Condition)}
                        </tr>

                </table>

                </div>
            </div>
        </div>
    </div>

    
    
    
    `
    }


    if (inspectionType == "NI") {
        checklistOut.innerHTML = checklistTemplate("NI")
    }

    else if (inspectionType == "BSI") {
        checklistOut.innerHTML = checklistTemplate('BSI')
    }
    else if (inspectionType == "BSMI") {
        checklistOut.innerHTML = checklistTemplate('BSMI')
    }
    else {
        checklistOut.innerHTML = checklistTemplate('two')
    }

    checklistOut.querySelectorAll('.hide').forEach(element => element.remove());

    let visibleAccordions = document.querySelectorAll('.accordion:not(.hide)')

    if (visibleAccordions.length == 1) {
        visibleAccordions.forEach(accordion => {
            accordion.classList.add('clicked')
            accordion.classList.add('active')
            accordion.querySelector('.arrow').innerHTML = '▼'
            accordion.nextElementSibling.classList.add('show')
        })
    }


    accordionLogic()
    openAllAccordionInMobile()
}

function populateAdvisorNotes(data) {

    let finalArr = data.Data.records
    let advisorNotesArr = []

    finalArr.forEach(item => {
        if (item.serviceAdvisorNote != '') {
            advisorNotesArr.push(item.serviceAdvisorNote)
        }
    })

    if (advisorNotesArr.length == 0 && Array.isArray(advisorNotesArr)) {
        advisorNotesSection.style.display = 'none'
    } else {
        let notesHtml = ``

        advisorNotesArr.forEach(note => {
            notesHtml += `
            <tr>
                <td><img src="./assets/Asset 1.png"></td>
                <td>${note}</td>
            </tr>
        `
        })

        advisorNotes.innerHTML = notesHtml
    }

}


function populateImages(arr) {
    let imagesArr = arr;
    let imgHtml = ``;

    // Create an array of promises for all watermarking processes
    const watermarkPromises = imagesArr.map(img => {
        return addWatermark(img.data).then(watermarkedImage => {
            return `
                <div class="grid-item">
                    <img src="data:image/jpeg;base64,${watermarkedImage}" alt="${img.Name}">
                    <div class="grid-text">${img.Name}</div>
                </div>
            `;
        }).catch(error => {
            console.error(error);
            return ''; // Return an empty string if there's an error
        });
    });

    // Wait for all watermark promises to resolve
    Promise.all(watermarkPromises).then(results => {
        imgHtml = results.join(''); // Combine all the HTML strings
        imageOut.innerHTML = imgHtml; // Update the DOM

        // Initialize the image gallery after the images are populated
        const gallery = new Viewer(document.getElementById('images'), {
            toolbar: {
                zoomIn: 1,
                zoomOut: 1,
                prev: 1,
                reset: 1,
                next: 1,
                rotateLeft: 1,
                rotateRight: 1,
            },
            title: [1, image => `${image.alt}`]
        });

        imgLoading.classList.add('hide')

        const target = imgSection;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    imgSection.classList.add('hide')
                } else {
                    imgSection.classList.remove('hide')
                }
            });
        }, {
            threshold: 0   // 0 means even 1px visible counts as intersecting
        });

        observer.observe(target);
    });

}


function addWatermark(base64Image) {
    return new Promise((resolve, reject) => {
        const watermark = new Image();
        watermark.src = './assets/ge watermark.png'; // Adjust the path to your PNG file
        watermark.onload = () => {
            const img = new Image();
            img.src = `data:image/png;base64,${base64Image}`;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const watermarkWidth = img.width / 3;
                const watermarkHeight = (watermark.height / watermark.width) * watermarkWidth;

                const xPos = (canvas.width - watermarkWidth) / 2;
                const yPos = (canvas.height - watermarkHeight) / 2;

                ctx.drawImage(watermark, xPos, yPos, watermarkWidth, watermarkHeight);

                const watermarkedBase64 = canvas.toDataURL('image/png').split(',')[1];
                resolve(watermarkedBase64);
            };
            img.onerror = (err) => {
                reject(err);
            };
        };
        watermark.onerror = (err) => {
            reject(err);
        };
    });
}
function accordionLogic() {

    let acc = document.getElementsByClassName("accordion");
    let panels = document.getElementsByClassName("panel");
    let i;

    for (i = 0; i < acc.length; i++) {
        acc[i].addEventListener("mouseover", function () {
            if (!this.classList.contains('clicked')) {
                this.classList.add("active");
                let panel = this.nextElementSibling;
                panel.style.display = "block";
                this.querySelector('.arrow').textContent = '▼';
            }
        });

        acc[i].addEventListener("mouseout", function () {
            if (!this.classList.contains('clicked')) {
                this.classList.remove("active");
                let panel = this.nextElementSibling;
                panel.style.display = "none";
                this.querySelector('.arrow').textContent = '►';
            }
        });

        acc[i].addEventListener("click", function () {
            this.classList.toggle("clicked");
            let panel = this.nextElementSibling;
            if (this.classList.contains('clicked')) {
                panel.style.display = "block";
                this.querySelector('.arrow').textContent = '▼';
            } else {
                panel.style.display = "none";
                this.querySelector('.arrow').textContent = '►';
            }
        });
    }

    for (i = 0; i < panels.length; i++) {
        panels[i].addEventListener("mouseover", function () {
            let button = this.previousElementSibling;
            if (!button.classList.contains('clicked')) {
                button.classList.add("active");
                this.style.display = "block";
                button.querySelector('.arrow').textContent = '▼';
            }
        });

        panels[i].addEventListener("mouseout", function () {
            let button = this.previousElementSibling;
            if (!button.classList.contains('clicked')) {
                button.classList.remove("active");
                this.style.display = "none";
                button.querySelector('.arrow').textContent = '►';
            }
        });

        panels[i].addEventListener("click", function () {
            let button = this.previousElementSibling;
            button.classList.toggle("clicked");
            if (button.classList.contains('clicked')) {
                this.style.display = "block";
                button.querySelector('.arrow').textContent = '▼';
            } else {
                this.style.display = "none";
                button.querySelector('.arrow').textContent = '►';
            }
        });
    }
}

// ? open all accordion on mobile

// window.addEventListener('resize', function () {
//     openAllAccordionInMobile()
// });

function openAllAccordionInMobile() {
    if (window.innerWidth <= 760) {
        let panels = document.querySelectorAll(".panel");
        let accordions = document.querySelectorAll(".accordion")
        let arrows = document.querySelectorAll(".arrow")

        panels.forEach(panel => panel.style.display = "block")

        accordions.forEach(accordion => {
            accordion.classList.add('clicked')
            accordion.classList.add('active')
        })

        arrows.forEach(arrow => arrow.innerText = "▼")

    }
}

// ? copy link btn logic

// copyLinkBtn.addEventListener('click', async () => {

//     let range = document.createRange();
//     range.selectNode(customerLink);
//     window.getSelection().removeAllRanges();
//     window.getSelection().addRange(range);
//     document.execCommand('copy');

//     window.getSelection().removeAllRanges();

//     copyLinkBtn.innerText = "Link Copied"
// })


function updateurl(tId, finalUrl) {

    // console.log("tId", tId);
    const body = JSON.stringify
        ({
            InspectionUrl: finalUrl
        });
    console.log("updated")

    try {
        fetch(`https://geapps.germanexperts.ae:7007/api/generalcrmapiupdateinspectionurl/${tId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'access_token': accessToken
            },
            body: body
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                console.log("fetch success");
            })
            .catch(error => {
                console.error('Error:', error);
            })
    } catch (error) {
        console.log(error)
    }



}


pdfDownloadBtn.addEventListener('click', () => openPdf())

function openPdf() {

    loaderOverlay.style.display = 'flex'

    // let apiUrl = `http://127.0.0.1:3000`
    let apiUrl = `https://geapps.germanexperts.ae:7010`

    try {
        fetch(`${apiUrl}/api/download-pdf`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pageParams: paramString
            }),
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }
                return res.json();
            })
            .then(response => {
                if (!response.downloadLink) {
                    throw new Error('Download link missing in response.');
                }

                loaderOverlay.style.display = 'none'
                // Open the PDF in a new browser tab
                const pdfUrl = `${apiUrl}${response.downloadLink}`;
                window.open(pdfUrl, '_self');


            })
            .catch(error => {
                console.error('Error opening PDF:', error);
                pdfDownloadBtn.innerText = "Error Opening PDF";
                loaderOverlay.style.display = 'none'
                setTimeout(() => {
                    pdfDownloadBtn.innerText = "Generate PDF";
                }, 4000);
            });
    } catch (error) {
        console.error('Error calling API:', error.message);
        pdfDownloadBtn.innerText = "Error Opening PDF";
        loaderOverlay.style.display = 'none'
        setTimeout(() => {
            pdfDownloadBtn.innerText = "Generate PDF";
        }, 4000);
    }
}

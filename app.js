
    async function init(){
        // show spinner 
        toggleLoading()
        daysAgo = selectDays.value
        selectCountry.value!='' ? country = selectCountry.value : ''
        confirmed = await getData(country,'confirmed', daysAgo)
        deaths = await getData(country,'deaths', daysAgo)
        recovered = await getData(country,'recovered', daysAgo)
        loadChart(country,daysAgo)
    }
  
    async function getData(country,status,days) {  
        const response = await fetch(`https://api.covid19api.com/country/${country}/status/${status}/live`)
        let data = await response.json()
      
        if(data.length>0 && data[0].Province){
            //data=grouByDate(data)
            data=groupByDate(data)
        }
        const today = new Date()
        const lastday = new Date(today.setDate(today.getDate()-days))
        return data.filter(item=> new Date(item.Date).getTime() > lastday.getTime())
    }
  
    function loadChart(country,days){

        const ctx = canvas.getContext('2d')

        chart ? chart.destroy() : ''

        chart = new Chart(ctx, {
            type: 'line',
            data: {
            labels: confirmed.map(item => new Intl.DateTimeFormat('en-US',{ month:'long', day: 'numeric'}).format(new Date(item.Date))),
            datasets : [
                {
                label: 'deaths',
                borderColor: '#FF3D67',
                data: deaths.map(item =>item.Cases),
                
                },
                {
                label: 'recovered',
                borderColor: '#4BC0C0',
                data: recovered.map(item =>item.Cases)
                },
                {
                label: 'confirmed',
                borderColor: '#059BFF',
                data: confirmed.map(item =>item.Cases)
                }
            ]
            },
            options: {
            scales: {
                xAxes: [{
                gridLines: {
                    display:false
                }
                }]
            },
            title: {
                display: true,
                text: country+': stats covid-19 from last '+days+' days',
                fontSize: 30,
                padding: 30,
                fontColor: '#0066A1',
            },
            legend: {
                position: 'top',
                labels: {
                padding: 20,
                boxWidth: 25,
                fontFamily: 'Calibri',
                fontColor: '#0066A1'
                }
            },
            layout: {
                padding: {
                right: 50,
                left: 50
                }
            },
            tooltips: {
                position: 'nearest',
                backgroundColor: '#0066A1',
                titleFontSize: 20,
                xPadding: 20,
                yPadding: 20,
                bodyFontSize: 15,
                bodySpacing: 10,
                mode: 'x',
                displayColors: true
            },
            elements: {
                line: {
                borderWidth: 4,
                fill: true,
                },
                point: {
                backgroundColor: 'white',
                hoverRadius: 8,
                hoverBorderWidth: 4
                }
            }
            }
        })

        toggleLoading()

    }
  
    function GetCountries(){

        fetch('https://api.covid19api.com/countries')
        .then(resp => resp.json())
        .then(data =>{
            // order alphabetic country list
            data.sort(compare)

            let txt = ''
            data.forEach(item=>{
                // right now, not showed data from USA because data charging spend to much time
                if(item.ISO2!='US') {
                    let selected=''
                    country==item.Slug ? selected='selected' : ''
                    txt+=`<option data-subtext="${item.ISO2}" value="${item.Slug}" ${selected}>${item.Country}</option>`
                }
            })
            // inject data for Select Country
            selectCountry.insertAdjacentHTML('beforeend',txt)
            // refresh data for Select Country
            $('.selectpicker').selectpicker('refresh')
        })

    }
  
    // order alphabetic country list 
    function compare(a, b) {

        // Use toUpperCase() to ignore character casing
        const countryA = a.Country.toUpperCase();
        const countryB = b.Country.toUpperCase();

        let comparison = 0;
        if (countryA > countryB) {
            comparison = 1;
        } else if (countryA < countryB) {
            comparison = -1;
        }
        return comparison;
    }

    function toggleLoading(){
        spinner.classList.toggle('d-none')
        canvas.classList.toggle('d-none')
    }

    // bug: not works properly
    // Country with Province need to be group by date, ignore Province
    function groupByDate(data){

        const diffDays=[...new Set(data.map(item=>item.Date))]
        
        let results=[]
        diffDays.forEach(item=> {

            let currentDay = new Intl.DateTimeFormat('en-US').format(new Date(item))
            let today = new Intl.DateTimeFormat('en-US').format(new Date())
            // usually today don't have data
            if(today!=currentDay){

                let current = {}
                let oneDay = data.filter(elem => new Date(elem.Date).getTime()===new Date(item).getTime())
                const cases = 
                oneDay.map(elem=>elem.Cases).reduce((totalCases, el) => totalCases + el)

                current.Country=oneDay[0].Country
                current.CountryCode=oneDay[0].CountryCode
                current.Status=oneDay[0].Status
                current.Date=oneDay[0].Date
                current.Cases=cases            
                results.push(current)
            }
        })
        debugger
        return results
        
    }
  
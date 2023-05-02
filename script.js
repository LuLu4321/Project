
function profs(data){

        const instructors = 
        data.map((section) => section.instructors).flat();
        const numInstructors = {};
        instructors.forEach((instructor) => {
            if (numInstructors[instructor]) {
                numInstructors[instructor]++;
            } else {
                numInstructors[instructor] = 1;
            }
        });
        const listed = 
        Object.entries(numInstructors).map(([instructor, number]) =>
         `<li>${instructor} (${number} ${number > 1 ? 'sections' : 'section'})</li>`);
    

        return {labels: Object.keys(numInstructors),
            dataForChart: Object.values(numInstructors),
            listed: listed};

}

function initChart (target, labels, y_val){
  const chart = new Chart(target, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: '# of section(s)',
        data: y_val,
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
  return chart;
}

function getMeetings(data){
  const getMeetings = data.reduce((accum, section) => {
    const meeting = section.meetings[0];
    if (!meeting){
      return accum;
    }

    const {days, start_time, end_time} = meeting;
    const startHour = parseInt(start_time.substring(0, 2));
    const endHour = parseInt(end_time.substring(0, 2));
    const startSuffix = startHour >= 12 ? "pm" : "am";
    const endSuffix = endHour >= 12 ? "pm" : "am";
    const startTime = `${start_time.substring(0, 5)}${startSuffix}`;
    const endTime = `${end_time.substring(0, 5)}${endSuffix}`;
    const time = `${startTime}-${endTime}`;
    if(accum[days]){
      if(accum[days][time]){
        accum[days][time]++;
      }else{
        accum[days][time] = 1;
      }
    } else{
      accum[days] = {[time]: 1};
    }
    return accum;
  
  }, {});
  const labels = Object.keys(getMeetings);
  const dataForChart = Object.values(getMeetings).map((obj) => {
    return Object.values(obj).reduce((sum,count) => sum + count, 0);
  });
  const listed = Object.entries(getMeetings).map(([days, obj]) => {
    const times = Object.entries(obj).map(([time, count]) => {
      return `${time} (${count} ${count > 1 ? "sections" : "section"})`;
    }).join('<br>');
    return `<li>${days}:<br>${times}\n</li>`;
  });
  return { labels, dataForChart, listed };
}

function filterData(data, filterType){
  if (filterType === 'Professors'){
    const { labels: profLabels, dataForChart: profData, listed: profListed } = profs(data);
    return {
      labels: profLabels,
      dataForChart: profData,
      listed: profListed,
    };
  } else if (filterType === 'Meetings') {
    const { labels: meetingLabels, dataForChart: meetingData, listed: meetingListed } = getMeetings(data);
    return {
      labels: meetingLabels,
      dataForChart: meetingData,
      listed: meetingListed,
    };
  }
  return null;
}

async function mainEvent() {

  const filterType = document.querySelector('#filter-type');
  const sectionsFilter = document.querySelector('#sections-filter');

    const form = document.querySelector('form');
    const input = document.querySelector('input');
    let prof_list = document.querySelector('.prof_list');
    let meetings_list = document.querySelector('.meetings');
    const chart = document.querySelector('#myChart');
    let myChart = null;

    const course_name = input.value;
    const response = await fetch(`https://api.umd.io/v1/courses/${course_name}/sections`);
    const data = await response.json();
    console.log(data);

    const filteredData = filterData(data, filterType.value);

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {

            const {labels: profLabels, dataForChart: profData, listed: profListed} 
            = profs(data);

            const {labels: meetingLabels, dataForChart: meetingData, listed: meetingListed } 
            = getMeetings(data)
            prof_list.innerHTML = profListed.join(' ');
            meetings_list.innerHTML = meetingListed.join(' ');
            
            if (myChart != null) {
                myChart.destroy();
            }
            myChart = initChart(chart, profLabels, profData);

            
        } catch (error){
            console.error(error);
            prof_list.innerHTML = 'Error occured try again'
            meetings_list.innerHTML = 'Error occured try again'
        }
    });

    filterType.addEventListener('change', (event) => {
      if (event.target.value === 'sections') {
        sectionsFilter.style.display = 'block';
      } else {
        sectionsFilter.style.display = 'none';
      }
    });

    filterType.addEventListener('change', () => {
      if (filteredData !== null) {
        prof_list.innerHTML = filteredData.listed.join(" ");
        meetings_list.innerHTML = "";
        if (myChart != null) {
          myChart.destroy();
        }
        myChart = initChart(chart, filteredData.labels, filteredData.dataForChart);
      } else {
        prof_list.innerHTML = "";
        meetings_list.innerHTML = "";
        if (myChart != null) {
          myChart.destroy();
        }
      }
    });

}

document.addEventListener('DOMContentLoaded', async () => mainEvent());

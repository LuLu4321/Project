
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
    const startTime = `${start_time.substring(0, 7)}`
    const endTime = `${end_time.substring(0, 7)}`;
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



async function mainEvent() {
  const filterType = document.querySelector('#filter-type');
  const filterButton = document.querySelector('#filter-button');
  const form = document.querySelector('form');
  const input = document.querySelector('input');
  const profList = document.querySelector('.prof_list');
  const meetingsList = document.querySelector('.meetings');
  const chart = document.querySelector('#myChart');
  let myChart = null;
  const meetingchart = document.querySelector('#meetingChart');
  let myMeetingchart = null;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const courseName = input.value;
      const response = await fetch(`https://api.umd.io/v1/courses/${courseName}/sections`);
      const data = await response.json();

      const { labels: profLabels, dataForChart: profData, listed: profListed } = profs(data);
      const { labels: meetingLabels, dataForChart: meetingData, listed: meetingListed } = getMeetings(data);
      profList.innerHTML = profListed.join(' ');
      meetingsList.innerHTML = meetingListed.join(' ');

      if (myChart != null) {
        myChart.destroy();
      }
      myChart = initChart(chart, profLabels, profData);

      if (myMeetingchart != null) {
        myMeetingchart.destroy();
      }
      myMeetingchart = initChart(meetingchart, meetingLabels, meetingData);



      filterButton.addEventListener('click', () => {
        if (filterType.value === 'professors') {
          profList.innerHTML = profListed.join(' ');
          meetingsList.innerHTML = '';
          chart.style.display = 'block';
          meetingchart.style.display = 'none';
        } else if (filterType.value === 'meetings'){
          meetingsList.innerHTML = meetingListed.join(' ');
          profList.innerHTML = '';
          meetingchart.style.display = 'block';
          chart.style.display = 'none';
        } else if (filterType.value === 'none'){
          profList.innerHTML = profListed.join(' ');
          meetingsList.innerHTML = meetingListed.join(' ');
          chart.style.display = 'block';
          meetingchart.style.display = 'block';
        }
      });

    } catch (error) {
      console.error(error);
      profList.innerHTML = 'Error occurred, try again';
      meetingsList.innerHTML = 'Error occurred, try again';
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => mainEvent());

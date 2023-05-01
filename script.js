
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
/*
function genEds(data){
  const genEds = {};
  data.forEach((section) => {
    if (section.gen_ed) {
    section.gen_ed.forEach((index) => {
      if (genEds[index]) {
        genEds[index]++;
      } else {
        genEds[index] = 1;
      }
    });
    }
  });
  console.log('genEds: ', genEds);
  const listed = Object.entries(genEds).map(([genEd_type, count]) =>
  `<li>${genEd_type} (${count} ${count > 1 ? 'counts' : 'count'})</li>`
  );
  return {
    labels: Object.keys(genEds),
    dataForChart: Object.values(genEds),
    listed: listed
  };
}
*/
function getMeetings(data){
  const getMeetings = data.reduce((accum, section) => {
    const meeting = section.meetings[0];
    if (!meeting){
      return accum;
    }

    const {days, start_time, end_time} = meeting;
    const time = `${start_time.substring(0,5)}-${end_time.substring(0,5)}`;
    days.split('').forEach((day) => {
      const key = `${day}_${time}`;
      if (accum[key]) {
        accum[key]++;
      } else {
        accum[key] = 1;
      }
    });
    return accum;
  },{});
  const labels = Object.keys(getMeetings);
  const dataForChart = Object.values(getMeetings);
  const listed = Object.entries(getMeetings).map(([key,count]) => {
    const [day,time]=key.split('_');
    return `<li>${day} ${time} (${count} ${count > 1 ? 'sections' : 'section'})</li>`
  });
  return { labels, dataForChart, listed };
}

async function mainEvent() {

    const form = document.querySelector('form');
    const input = document.querySelector('input');
    let prof_list = document.querySelector('.prof_list');
    let meetings_list = document.querySelector('.meetings');
    //let gen_ed_list = document.querySelector('.gen_ed_list');
    //console.log('gen_ed_list after the querySelector: ', gen_ed_list);
    const chart = document.querySelector('#myChart');
    let myChart = null;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const course_name = input.value;
        try {
            const response = await fetch(`https://api.umd.io/v1/courses/${course_name}/sections`);
            const data = await response.json();
            console.log(data);

            const {labels: profLabels, dataForChart: profData, listed: profListed} 
            = profs(data);

            const {labels: meetingLabels, dataForChart: meetingData, listed: meetingListed } 
            = getMeetings(data)
            prof_list.innerHTML = profListed.join(' ');
            meetings_list.innerHTML = meetingListed.join(' ');
            /* console.log('gen_ed_list before: ', gen_ed_list);
            const {labels: genEdlabels, dataForChart: genEdData, listed: genEdlisted} 
            = genEds(data);
            console.log('gen_ed_list after: ', gen_ed_list);

            if (gen_ed_list != null) {
              gen_ed_list.innerHTML = genEdlisted.join(" ");
            }
            */
            
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

}

document.addEventListener('DOMContentLoaded', async () => mainEvent());

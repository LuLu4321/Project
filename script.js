
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

async function mainEvent() {

    const form = document.querySelector('form');
    const input = document.querySelector('input');
    let prof_list = document.querySelector('.prof_list');
    const chart = document.querySelector('#myChart');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const course_name = input.value;
        try {
            const response = await fetch(`https://api.umd.io/v1/courses/${course_name}/sections`);
            const data = await response.json();
            const {labels,dataForChart,listed} = profs(data);
            prof_list.innerHTML = listed.join(' ');
            initChart(chart,labels,dataForChart);
        } catch (error){
            console.error(error);
            prof_list.innerHTML = 'Error occured try again'
        }
    });

}

document.addEventListener('DOMContentLoaded', async () => mainEvent());

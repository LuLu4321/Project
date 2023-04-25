
function initChart (target){

  const chart = new Chart(target, {
    type: 'bar',
    data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [{
        label: '# of Votes',
        data: [12, 19, 3, 5, 2, 3],
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
    const prof_list = document.querySelector('.prof_list');
    const chart = document.querySelector('#myChart');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const course_name = input.value;
        try {
            const results = await fetch(`https://api.umd.io/v1/courses/${course_name}/sections`);
            const data = await results.json();
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
            Object.entries(numInstructors).map(([instructor, number]) => `<li>${instructor} (${number} ${number > 1 ? 'sections' : 'section'})</li>`);
            prof_list.innerHTML = listed.join(' ');
            //`<ol>${listed.join('')}</ol>`;
        } catch (error){
            console.error(error);
            prof_list.innerHTML = 'Error occured try again'
        }
    });
    const newChart = initChart(chart);
}

document.addEventListener('DOMContentLoaded', async () => mainEvent());

// hello world
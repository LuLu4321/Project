
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



async function mainEvent() {
  const filterType = document.querySelector('#filter-type');
  const sectionsFilter = document.querySelector('#sections-filter');
  const filterButton = document.querySelector('#filter-button');
  const sectionsDropdown = document.querySelector('#sections');
  const form = document.querySelector('form');
  const input = document.querySelector('input');
  const profList = document.querySelector('.prof_list');
  const meetingsList = document.querySelector('.meetings');
  const chart = document.querySelector('#myChart');
  let myChart = null;

  filterType.addEventListener('change', (event) => {
    if (event.target.value === 'sections') {
      sectionsFilter.style.display = 'block';
    } else {
      sectionsFilter.style.display = 'none';
    }
  });

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



      filterButton.addEventListener('click', () => {
        if (filterType.value === 'professors') {
          profList.innerHTML = profListed.join(' ');
          meetingsList.innerHTML = '';
        } else if (filterType.value === 'meetings'){
          meetingsList.innerHTML = meetingListed.join(' ');
          profList.innerHTML = '';
          myChart.destroy();
        } else if (filterType.value === 'sections'){
          const numSections = parseInt(sectionsDropdown.value);
          let filteredProfList = [];
          let filteredMeetingList = [];

          for (let i = 0; i < profListed.length; i++) {
            const sectionCount = parseInt(profListed[i].match(/\((\d+) sections\)/)[1]);
            if (sectionCount === numSections) {
            filteredProfList.push(profListed[i]);
           }
          }
          profList.innerHTML = filteredProfList.join(' ');

          for (let i = 0; i < meetingListed.length; i++) {
            const sectionCount = parseInt(meetingListed[i].match(/\((\d+) sections\)/)[1]);
            if (sectionCount === numSections) {
            filteredMeetingList.push(meetingListed[i]);
            }
          }
          meetingsList.innerHTML = filteredMeetingList.join(' ');
          myChart.destroy();

        }  
               /*
                for (let i = 0; i < meetingListed.length; i++) {
            filteredMeetingList = meetingListed.filter((meeting) => meeting.includes(`${i} sections`));
          }
          if (numSections === 1) {
          const filteredProfessors = profListed.filter((professor) => professor.includes('(1 section)'));
          const filteredMeetings = meetingListed.filter((meeting) => meeting.includes('(1 section)'));
          profList.innerHTML = filteredProfessors.join(' ');
          meetingsList.innerHTML = filteredMeetings.join(' ');
          } else if (numSections === 2) {
          const filteredProfessors = profListed.filter((professor) => professor.includes('(2 sections)'));
          const filteredMeetings = meetingListed.filter((meeting) => meeting.includes('(2 sections)'));
          profList.innerHTML = filteredProfessors.join(' ');
          meetingsList.innerHTML = filteredMeetings.join(' ');
          } else if (numSections === 3) {
          const filteredProfessors = profListed.filter((professor) => professor.includes('(3 sections)'));
          const filteredMeetings = meetingListed.filter((meeting) => meeting.includes('(3 sections)'));
          profList.innerHTML = filteredProfessors.join(' ');
          meetingsList.innerHTML = filteredMeetings.join(' ');
          } else if (numSections === 4) {
          const filteredProfessors = profListed.filter((professor) => professor.includes('(4 sections)'));
          const filteredMeetings = meetingListed.filter((meeting) => meeting.includes('(4 sections)'));
          profList.innerHTML = filteredProfessors.join(' ');
          meetingsList.innerHTML = filteredMeetings.join(' ');
        } else if (numSections === 5) {
        const filteredProfessors = profListed.filter((professor) => professor.includes('(5 sections)'));
        const filteredMeetings = meetingListed.filter((meeting) => meeting.includes('(5 sections)'));
        profList.innerHTML = filteredProfessors.join(' ');
        meetingsList.innerHTML = filteredMeetings.join(' ');
        } else if (numSections === 6) {
        const filteredProfessors = profListed.filter((professor) => professor.includes('(6 sections)'));
        const filteredMeetings = meetingListed.filter((meeting) => meeting.includes('(6 sections)'));
        profList.innerHTML = filteredProfessors.join(' ');
        meetingsList.innerHTML = filteredMeetings.join(' ');
      } else if (numSections === 7) {
        const filteredProfessors = profListed.filter((professor) => professor.includes('(7 sections)'));
        const filteredMeetings = meetingListed.filter((meeting) => meeting.includes('(7 sections)'));
        profList.innerHTML = filteredProfessors.join(' ');
        meetingsList.innerHTML = filteredMeetings.join(' ');
      } else if (numSections === 8) {
      const filteredProfessors = profListed.filter((professor) => professor.includes('(8 sections)'));
      const filteredMeetings = meetingListed.filter((meeting) => meeting.includes('(8 sections)'));
      profList.innerHTML = filteredProfessors.join(' ');
      meetingsList.innerHTML = filteredMeetings.join(' ');
  
  }
  */
      });

    } catch (error) {
      console.error(error);
      profList.innerHTML = 'Error occurred, try again';
      meetingsList.innerHTML = 'Error occurred, try again';
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => mainEvent());

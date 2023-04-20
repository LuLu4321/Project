
async function mainEvent() {

    const form = document.querySelector('form');
    const input = document.querySelector('input');
    const prof_list = document.querySelector('.prof_list');

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

}

document.addEventListener('DOMContentLoaded', async () => mainEvent());

// hello world
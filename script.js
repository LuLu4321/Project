
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
            const instructors = data.map((section) => section.instructors);
            prof_list.innerHTML = instructors.join(', ');
        } catch (error){
            console.error(error);
            prof_list.innerHTML = 'Error occured try again'
        }
    });

}

document.addEventListener('DOMContentLoaded', async () => mainEvent());
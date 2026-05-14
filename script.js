/*themes*/
const theme_btn= document.querySelector('#change_theme');
const root=document.querySelector(':root');
const saved_theme = localStorage.getItem('theme');

if(saved_theme === 'light'){
    root.classList.add('light_theme');
}

function toggle_theme(){
    root.classList.toggle('light_theme');
    if(root.classList.contains('light_theme')){
        localStorage.setItem('theme','light');
    }
    else{
        localStorage.setItem('theme','dark');
    }
}

theme_btn.addEventListener('click', toggle_theme);

/*timeline js*/
function timeline_expand(e){
        const title=e.target.closest('.title');
        if(!title) return;
        const item=title.parentElement;
        const isexpanded=item.classList.toggle('active');
        title.setAttribute('aria-expanded', isexpanded);
}

const timeline=document.getElementById('timeline');
if(timeline){
    timeline.addEventListener('click', timeline_expand);
}

const scroll_timeline_object=document.querySelector('.animate_education_timeline');
if(scroll_timeline_object){
    const observe=new IntersectionObserver((entries)=>{
        if (entries[0].isIntersecting){
            scroll_timeline_object.classList.add('is_visible');
            observe.disconnect();
        };
    },{threshold:0.1})
    observe.observe(scroll_timeline_object);
}

/*projects javascript*/
const projects_list=[
    {
        title:'Random Walk and Diffusion Simulator in 2D',
        tags:['Python', 'Scientific','Progress'],
        note:'It is a 2D random walk and diffusion simulator in python. It helps with random walk simulations and gradient optimisation. In our CIS-1 course we had covered these topics. I built it to compile the various methods for energy minimisation in a single library as a personal project. The graphs are given in png and hdf5 format making it easy to save the results. It also covers many different energy models. The project is still currently in progress. Currently the package has no documentation and is limited to a small number of energy models. It also needs to be tested further. As I continue to work on the project I will improve the code structure to make it more maintainable and also improve the quality of the package as I learn the required mathematical and scientific knowledge. ',
        link: 'https://github.com/sanjitakr/Random_Walk'
    },
    {
        title:'Unix shell',
        tags:['C', 'Complete'],
        note:'It is a basic shell that implements the following commands: cd, pwd, echo, env, setenv,getenv,unsetenv,which, help,exit,quit. The current shell does not implement piping, redirection,globbing and quoting. I built it to get more familiar with how exactly the shell works as well as trying to implement these functions from scratch using C. I tried to use as few libraries as possible and if I were to do it again I would definitely include the remaining features.',
        link: 'https://github.com/sanjitakr/Unix_Shell/tree/main'
    },
    {
        title:'Twixt',
        tags:['C', 'Complete'],
        note:'It is a game made for CPro course project. It is done purely on CLI using very no additional libraries.',
        link: 'https://github.com/sanjitakr/Twixt'
    },
    {
        title:'Personal Site',
        tags:['Web-dev', 'Complete'],
        note:'I built this site for my ISS course Spring 26 at IIITH. I learnt a lot about accessibility, lighthouse audits, color contrast checks and other important steps in web development.',
        link: 'https://github.com/sanjitakr/sanjitakr.github.io'
    },
    {
        title:'Chess Rating Tracker',
        tags:['Web-dev', 'Complete'],
        note:'It allows you to track your ratings and see your progress. It was intended more as a personal project.',
        link: 'https://github.com/sanjitakr/road_to_x_chess_tracker/tree/main'
    }
]

let selected_tags=[]


function generate_project_on_page(projects_list){
    const grid=document.getElementById('project_container');
    if(!grid)return;
    grid.innerHTML='';
    if(projects_list.length===0){
        grid.innerHTML='<p>No projects found</p>';
        return;
    }
    projects_list.forEach((project, index) => {
        const box=document.createElement('div');
        box.classList.add('project_item');
        if(index===0){
            box.classList.add('top');
        }
        const title=document.createElement('h2');
        title.textContent=project.title;
        box.appendChild(title);

        const note=document.createElement('p');
        note.textContent=project.note;
        box.appendChild(note);

        const tag_contain =document.createElement('div');
        tag_contain.classList.add('tag-container');
        project.tags.forEach(tag_title => {
            const tag_span=document.createElement('span');
            tag_span.classList.add('tag');
            tag_span.textContent=tag_title;
            tag_contain.appendChild(tag_span);
        });
        box.appendChild(tag_contain);

        const link=document.createElement('a');
        link.href=project.link;
        link.textContent=`Go to Github Project: ${project.title}`;
        link.setAttribute('aria-label', `Go to github project: ${project.title}`);
        link.classList.add('project_links');
        box.appendChild(link);
        grid.appendChild(box);
    });
}

/*the filtered tags are checked  and displayed on the screen. The filter button and url is also updated to reflect the changes*/
function filter_tags(tag_names){
    let filtered;
    if(!tag_names || tag_names.length===0){
        filtered=projects_list;
        tag_names=[]
    }
    else{
        filtered=projects_list.filter(project=>tag_names.some(tag=>project.tags.includes(tag)));
    }
    generate_project_on_page(filtered);
    let new_url;
    if(tag_names.length===0){
       new_url= window.location.pathname
    }
    else{
        new_url=`?tags=${tag_names.join(',')}`;
    }
    window.history.pushState({tags:tag_names},'',new_url);

    document.querySelectorAll('.filter_button').forEach(button => {
        const tag=button.getAttribute('data-tag');
        if(tag==='All'){
            if(tag_names.length===0){
                button.classList.add('active');
                button.setAttribute('aria-pressed','true');
            }
            else{
                 button.classList.remove('active');
                button.setAttribute('aria-pressed','false')
            }
            return;
        }
        if(tag_names.includes(tag)){
            button.classList.add('active');
            button.setAttribute('aria-pressed','true');
        }
        else{
            button.classList.remove('active');
            button.setAttribute('aria-pressed','false')
        }
    })

}

/*checks for tags selected and then filters through them*/
document.querySelectorAll('.filter_button').forEach(button =>{
        button.addEventListener('click',() => {
            const tag=button.getAttribute('data-tag');
            if(tag==='All'){
                selected_tags=[];
                filter_tags(selected_tags);
                return;
            }
            else{
                if(selected_tags.includes(tag)){
                    selected_tags=selected_tags.filter(t=>t!==tag);
                }
                else{
                    selected_tags.push(tag);
                }
            }
            filter_tags(selected_tags);
        });
});

window.addEventListener('load', () => {
    if(document.getElementById('project_container')){
        const parameters=new URLSearchParams(window.location.search);
        const tags=parameters.get('tags');
        if(tags){
            selected_tags=tags.split(',');
            filter_tags(selected_tags);
        }
        else{
            generate_project_on_page(projects_list);
        }
    }
})
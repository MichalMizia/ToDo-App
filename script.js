// localStorage.clear()
const list_key = '_LOCAL_STORAGE_LIST_KEY'
const current_list_key = '_LOCAL_STORAGE_CURRENT_KEY'

const addToDoForm = document.querySelector('[data-add-todo-form]')
const addToDoInput = document.querySelector('[data-add-todo-input]')
const addListForm = document.querySelector('[data-add-list-form]')
const addListInput = document.querySelector('[data-add-list-input]')
const editListBox = document.querySelector('[data-edit-list-box]')
const clearComplete = document.querySelector('[data-clear-complete]')
const listTitle = document.querySelector('[data-list-title]')
const tasksRemaining = document.querySelector('[data-tasks-remaining]')

const unfinishedContainer = document.querySelector('[data-unfinished-container]')
const finishedContainer = document.querySelector('[data-finished-container]')

const listOfLists = document.querySelector('[data-lists]')
const finishedTasksList = document.querySelector('[data-finished-tasks-list]')
const unfinishedTasksList = document.querySelector('[data-unfinished-tasks-list]')
let lists = JSON.parse(localStorage.getItem(list_key)) || []
let currentListName = localStorage.getItem(current_list_key) || undefined


function renderLists(){
        if(currentListName === undefined || currentListName === null) return
        window.localStorage.setItem(current_list_key, currentListName)
        titleAndTasksRemaining()

        listOfLists.innerHTML = ''
        if(lists.length === 0) return;
        window.localStorage.setItem(list_key, JSON.stringify(lists))

        lists.forEach(list =>{
            const currentList = list.name
            const li = document.createElement('li')
            li.classList.add('single-list')
            const title = document.createElement('h3')
            title.setAttribute('data-list-name', currentList)
            title.textContent = currentList
            const editBtn = document.createElement('img')
            editBtn.setAttribute("src", "./edit_icon.svg")
            editBtn.setAttribute("alt", "edit list name")
            const delBtn = document.createElement('img')
            delBtn.setAttribute("src", "./trash.svg")
            delBtn.setAttribute("alt", "delete list")

            const btnContainer = document.createElement('div')
            btnContainer.appendChild(editBtn)
            btnContainer.appendChild(delBtn)
            li.appendChild(title)
            li.appendChild(btnContainer)

            if(list.name === currentListName) li.classList.add('active')

            listOfLists.appendChild(li)
            delBtn.addEventListener('click', (e)=>{
                e.preventDefault()
                const index = lists.findIndex(list => list.name === currentList)
                if(currentListName === lists[index].name){
                    unfinishedTasksList.innerHTML = ''
                    finishedTasksList.innerHTML = ''
                }

                lists = lists.filter(list => list.name !== currentList)
                renderLists()
                
            })
            editBtn.addEventListener('click', (e)=>{
                e.preventDefault()
                editListBox.classList.remove('hide')
                const index = lists.findIndex(list => list.name === currentList)
                const input = editListBox.querySelector('input')
                input.value = lists[index].name
                const confirmBtn = editListBox.querySelector('[data-confirm-btn]')
                const cancelBtn = editListBox.querySelector('[data-cancel-btn]')
                confirmBtn.addEventListener('click', ()=>{
                    if(input.value.length === 0) return
                    if(currentListName === lists[index].name) currentListName = input.value
                    lists[index].name = input.value
                    renderLists()
                })
                cancelBtn.addEventListener('click', ()=>{
                    editListBox.classList.add('hide')
                    renderLists()
                })
            })
        })
    }

function save(){
    window.localStorage.setItem(list_key, JSON.stringify(lists))
    if(currentListName === undefined || currentListName === null) return
    window.localStorage.setItem(current_list_key, currentListName)
}

addListForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    if(addListInput.value.length === 0) return
    lists.push(
        {
            name: addListInput.value,
            tasks: []
        }
    )
    addListInput.value = ''
    renderLists()
})

listOfLists.addEventListener('click', (e)=>{
    if(e.target.tagName.toLowerCase() !== 'h3') return
    currentListName = e.target.getAttribute('data-list-name')
    window.localStorage.setItem(current_list_key, currentListName)
    renderLists()
    renderTasks(currentListName)
})

function renderTasks(currentListName){
    const index = lists.findIndex(list => list.name === currentListName)

    unfinishedTasksList.innerHTML = ''
    finishedTasksList.innerHTML = ''
    if(lists[index].tasks.length === 0) return
    lists[index].tasks.forEach(task =>{
        const li = document.createElement('li')
        li.classList.add('todo')
        li.setAttribute('draggable', 'true')
        li.textContent = task.taskName

        li.addEventListener('dragstart', ()=>{
            li.classList.add('dragging')
        })
        li.addEventListener('dragend', ()=>{
            li.classList.remove('dragging')
        })

        if(task.complete === true){
            finishedTasksList.appendChild(li)
        }else{
            unfinishedTasksList.appendChild(li)
        }

    })
}


unfinishedContainer.addEventListener('dragover', (e)=>{
    e.preventDefault()
    const dragged = document.querySelector('.dragging')
    unfinishedTasksList.appendChild(dragged)
    const index = lists.findIndex(list => list.name === currentListName)
    const taskIndex = lists[index].tasks.findIndex(task => task.taskName === dragged.textContent) 
    lists[index].tasks[taskIndex].complete = false
    save()
    titleAndTasksRemaining()
})
finishedContainer.addEventListener('dragover', (e)=>{
    e.preventDefault()
    const dragged = document.querySelector('.dragging')
    finishedTasksList.appendChild(dragged)
    const index = lists.findIndex(list => list.name === currentListName)
    const taskIndex = lists[index].tasks.findIndex(task => task.taskName === dragged.textContent) 
    lists[index].tasks[taskIndex].complete = true
    save()
    titleAndTasksRemaining()
})


addToDoForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    if(currentListName === undefined || currentListName === null || addToDoInput.value.length === 0) return
    const index = lists.findIndex(list => list.name === currentListName)
    lists[index].tasks.push(
        {
           taskName: addToDoInput.value,
           complete: false 
        }
    )
    save()
    titleAndTasksRemaining()
    renderTasks(currentListName)
    addToDoInput.value = ''
})

clearComplete.addEventListener('click', ()=>{
    if(currentListName === undefined || currentListName === null) return
    const index = lists.findIndex(list => list.name === currentListName)
    lists[index].tasks = lists[index].tasks.filter(task => task.complete === false)
    save()
    renderTasks(currentListName)
})

function titleAndTasksRemaining(){
    if(currentListName === undefined || currentListName === null) return
    const index = lists.findIndex(list => list.name === currentListName)

    if(index === -1){
        listTitle.textContent = 'Select a list'
        tasksRemaining.textContent = '0 tasks remaining'
    }else{
        listTitle.textContent = lists[index].name
        const taskCount = lists[index].tasks.filter(task => task.complete === false).length
        const taskString = (taskCount === 1 ? `1 task remaining` : `${taskCount} tasks remaining`)
        tasksRemaining.textContent = taskString
    }
    
}

renderLists()
if(currentListName !== null && currentListName !== undefined){
    renderTasks(currentListName)
}

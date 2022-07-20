const listContainer = document.querySelector('[data-lists]')
const newListForm = document.querySelector('[data-new-list-form]')
const newListInput = document.querySelector('[data-new-list-input]')
const deleteListButton = document.querySelector('[data-delete-list-button]')
const listDisplayContainer = document.querySelector('[data-list-display-container]')
const listTitleElement = document.querySelector('[data-list-title]')
const listCountElement = document.querySelector('[data-list-count]')
const tasksContainer = document.querySelector('[data-tasks]')
const taskTemplate = document.getElementById('task-template')
const newTaskForm = document.querySelector('[data-new-task-form]')
const newTaskInput = document.querySelector('[data-new-task-input]')
const clearCompleteTasksButton = document.querySelector('[data-clear-complete-tasks-button]')

const LOCAL_STORAGE_LIST_KEY = 'task.lists'
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = 'task.selectedListId'

let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || []
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY)

listContainer.addEventListener('click', e => {
  if (e.target.tagName.toLowerCase() === 'li') {
    selectedListId = e.target.dataset.listId
    saveAndRender()
  }
}) 

tasksContainer.addEventListener('click', e => {
  if (e.target.tagName.toLowerCase() === 'input') {
    const selectedList = lists.find(list => list.id === selectedListId)
    const selectedTask = selectedList.tasks.find(task => task.id === e.target.id)
    selectedTask.complete = e.target.checked
    save()
    renderTaskCount(selectedList)
  }
  if (e.target.tagName.toLowerCase() === 'div') {
    const selectedList = lists.find(list => list.id === selectedListId)
    const selectedTask = selectedList.tasks.find(task => task.id === e.target.id)
    selectedTask.priority = !selectedTask.priority
    saveAndRender()
    renderTaskCount(selectedList)
  }
}) 

tasksContainer.addEventListener('change', e => {
  if (e.target.className === 'date-input') {
    const selectedList = lists.find(list => list.id === selectedListId)
    const selectedTask = selectedList.tasks.find(task => task.id === e.target.id)
    selectedTask.dueDate = e.target.value
    saveAndRender()
    renderTaskCount(selectedList)
  }
}) 

clearCompleteTasksButton.addEventListener('click', e => {
  const selectedList = lists.find(list => list.id === selectedListId)
  selectedList.tasks = selectedList.tasks.filter(task => !task.complete)
  saveAndRender()
})

deleteListButton.addEventListener('click', e => {
  lists = lists.filter(list => list.id !== selectedListId)
  selectedListId = null
  saveAndRender()
})

newListForm.addEventListener('submit', e => {
  e.preventDefault()
  const listName = newListInput.value
  if (listName == null || listName === '') return
  const list = createList(listName)
  newListInput.value = null
  lists.push(list)
  saveAndRender()
})

newTaskForm.addEventListener('submit', e => {
  e.preventDefault()
  const taskName = newTaskInput.value
  if (taskName == null || taskName === '') return
  const selectedList = lists.find(list => list.id === selectedListId)
  const task = createTask(taskName, selectedList)
  newTaskInput.value = null
  
  selectedList.tasks.push(task)
  saveAndRender()
})

function createList(name) {
  return {
    id: Date.now().toString(),
    name: name,
    tasks: []
  }
}

function createTask(name,selectedList) {
  return {
    id: Date.now().toString(),
    name: name,
    complete: false,
    priority: false,
    dueDate: formatDate(),
    listName: selectedList.name
  }
}

function saveAndRender() {
  save()
  render()
}

function save() {
  localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists))
  localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId)
}

function render() {
  clearElement(listContainer)
  renderLists()

  const selectedList = lists.find(list => list.id === selectedListId)

  if (selectedListId == null) {
    listDisplayContainer.style.display = 'none'
  } else {
    listDisplayContainer.style.display = ''
    listTitleElement.innerText = selectedList.name
    renderTaskCount(selectedList)
    clearElement(tasksContainer)
    renderTasks(selectedList)
  }
}

function renderTasks(selectedList) {
  selectedList.tasks.forEach(task => {
    const taskElement = document.importNode(taskTemplate.content, true)
    const checkbox = taskElement.querySelector('input')
    checkbox.id = task.id
    checkbox.checked = task.complete
    const label = taskElement.querySelector('label')
    label.htmlFor = task.id
    selectedListId === 'today' ? label.append(`${task.name} (${task.listName})`) : label.append(task.name)
    const star = taskElement.querySelector('.fa')
    star.setAttribute('id', task.id)
    task.priority ? star.classList.add('checked') : star.classList.remove('checked')
    const dueDate = taskElement.querySelector('.date-input')
    dueDate.id = task.id
    dueDate.value = task.dueDate
    tasksContainer.appendChild(taskElement)
  })
}

function renderTaskCount(selectedList) {
    const incompleteTasksCount = selectedList.tasks.filter(task => !task.complete).length
    const taskString = incompleteTasksCount === 1 ? 'task' : 'tasks'
    listCountElement.innerText = `${incompleteTasksCount} ${taskString} remaining`
}

function addTasksToTodayList(lists) {
  lists[0].tasks = []
  let todayLists = lists.filter(n => n.id != 'today')
  todayLists.forEach(list => {
    list.tasks.forEach(task => {
      if (task.dueDate === formatDate()) {
        lists[0].tasks.push(task)
      }
    })
  })
}

function renderLists() {
  let todayList = createList('Today')
  todayList.id = 'today'
  if (!lists.find(n => n.id === 'today')) lists.unshift(todayList)
  addTasksToTodayList(lists)

  lists.forEach(list => {
    const listElement  =document.createElement('li')
    listElement.dataset.listId = list.id
    listElement.classList.add("list-name")
    listElement.innerText = list.name
    if (list.id === selectedListId) listElement.classList.add('active-list')
    listContainer.appendChild(listElement)
  })
}

function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild)
  }
}

function formatDate() {
  let today = new Date()
  return today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
}


render()
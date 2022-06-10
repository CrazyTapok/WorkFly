const prefix = 'https://it-academy-js-api-zmicerboksha.vercel.app/api/4/md/'


const registrationForm = document.querySelector('.registration')
const registrationError = document.querySelector('#registrationError')
const goLoginForm = document.querySelector('#signIn')

const loginForm = document.querySelector('.login')
const loginError = document.querySelector('#loginError')
const goRegistrationForm = document.querySelector('#registration')

const authorizationPage = document.querySelector('.loginBox')
const mainPage = document.querySelector('.main')
const loader = document.querySelector('.loader_box')
const littleLoader = document.querySelector('.little-loader')

const emptyBoard = document.querySelector('.emptyBoard')
const fullBoard = document.querySelector('.fullBoard')

const profile = document.querySelector('.profile')

const modalWindow = document.querySelector('#modalWindow')
const modalContent =  document.querySelector('.modal-content')
const modalTitle = document.querySelector('#modalTitle')
const modalBody = document.querySelector('#modalBody')


let user = JSON.parse(localStorage.getItem('user')) || {}
let userNotes = JSON.parse(localStorage.getItem('userNotes')) || [] 
let categories = JSON.parse(localStorage.getItem('categories')) || []



function changeLocation() {

    switch (location.hash) {
            
        case '#registration':

            if (Object.keys(user).length !== 0) {
                location.hash = '#dashboard'
                return
            }

            mainPage.hidden = true
            loginForm.hidden = true
            authorizationPage.hidden = false
            registrationForm.hidden = false
                
            break

        case '#login':

            if (Object.keys(user).length !== 0) {
                location.hash = '#dashboard'
                return
            }

            mainPage.hidden = true
            registrationForm.hidden = true
            authorizationPage.hidden = false
            loginForm.hidden = false

            break

        case '#dashboard':

            if (Object.keys(user).length === 0) {
                location.hash = '#login'
                return
            }

            authorizationPage.hidden = true
            loader.hidden = true
            profile.hidden = true
            mainPage.hidden = false

            drawColumns()
            
            if (categories.length === 0) {
                fullBoard.hidden = true
                emptyBoard.hidden = false
            } else { 
                emptyBoard.hidden = true
                fullBoard.hidden = false
            }
            
            break

        case '#profile':

            if (Object.keys(user).length === 0) {
                location.hash = '#login'
                return
            }

            authorizationPage.hidden = true
            loginForm.hidden = true
            fullBoard.hidden = true
            emptyBoard.hidden = true
            mainPage.hidden = false
            profile.hidden = false

            showUserDate()
            showCharts()

            break

        case '':
            location.hash = '#login'
           
            break
    }
}

window.addEventListener('hashchange',changeLocation)

changeLocation()


registrationForm.addEventListener('submit', e =>{
    e.preventDefault()
    clearForm(registrationForm.elements)
    registrationError.innerHTML = ''

    const email = registrationForm.email.value
    const password = registrationForm.password.value
    const repeatPassword = registrationForm.repeatPassword.value
    const firstName = registrationForm.firstName.value
    const lastName = registrationForm.lastName.value
    const number = registrationForm.number.value

    if (!(/^[а-яa-z]*$/i.test(firstName)) || !(/^[а-яa-z]*$/i.test(lastName)) || email.trim() === "" || password.trim() === "" || repeatPassword.trim() === "") {

        if (!(/^[а-яa-z]/i.test(firstName))) {
            addInvalid(registrationForm.firstName)
        }

        if (!(/^[а-яa-z]/i.test(lastName))) {
            addInvalid(registrationForm.lastName)
        }

        if (email.trim() === "") {
            addInvalid(registrationForm.email)
        }

        if (password.trim() === "") {
            addInvalid(registrationForm.password)
        } 

        if (repeatPassword.trim() === "") {
            addInvalid(registrationForm.repeatPassword)
        }

    } else if (password !== repeatPassword) {
        addInvalid(registrationForm.repeatPassword)
        registrationError.innerHTML = 'Confirm password does not match that entered in the password field, please try again. '
    }else{
        loader.hidden = false
        authorizationPage.hidden = true
        registrationUser(email, password, firstName, lastName, number)
    }
})

goRegistrationForm.addEventListener('click', () => {
    clearForm(loginForm.elements)
    loginError.innerHTML = ''
})

function registrationUser(_email, _password, _firstName, _lastName, _number) {
    fetch(prefix + 'user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: _email,
          password: _password,
          firstName: _firstName,
          lastName: _lastName,
          number: _number
        }),
    })
    .then(response => {
        if (response.ok !== true) {
            throw new Error("This Email is busy, please change your Email")
        }
    })
    .then(() => {
        document.forms.registration.reset()
        logIn(_email, _password, true)
    })
    .catch(error => {
        addInvalid(registrationForm.email)
        loader.hidden = true
        authorizationPage.hidden = false

        registrationError.innerHTML = `${error.message}`
    })
}



loginForm.addEventListener('submit', e =>{
    e.preventDefault()
    clearForm(loginForm.elements)
    loginError.innerHTML = ''

    const email = loginForm.email.value
    const password = loginForm.password.value
    
    if (email.trim() === "" || password.trim() === "") {
        if (email.trim() === "") {
            addInvalid(loginForm.email)
        }
        
        if (password.trim() === "") {
            addInvalid(loginForm.password)
        } 
    }else{
        loader.hidden = false
        authorizationPage.hidden = true
        logIn(email, password, false)
    }
})

function logIn(_email, _password, _newUser) {
    fetch(prefix + 'user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: _email,
          password: _password,
        }),
    })
    .then(response => response.json())
    .then(result =>{

        if (result === null) {
            throw new Error("Password or email entered incorrectly")
        }

        user.id = result.id
        user.email = result.email
        user.firstName = result.firstName
        user.lastName = result.lastName
        user.phone = result.number

        userNotes = result.notes
        categories = result.categories.sort((a, b) => a.priority > b.priority ? 1 : -1)

    })
    .then(() => {
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('userNotes', JSON.stringify(userNotes))
        localStorage.setItem('categories', JSON.stringify(categories))
        document.forms.login.reset()
    })
    .then(() => {
        if (categories.length === 0) {
            location.hash = '#dashboard'
        } else {
            drawColumns()
            location.hash = '#dashboard'
        }
    })
    .catch(error => {
        addInvalid(loginForm.email)
        addInvalid(loginForm.password)
        loader.hidden = true
        authorizationPage.hidden = false
        
        loginError.innerHTML = `${error.message}`
    })
}

goLoginForm.addEventListener('click', () => {
    clearForm(registrationForm.elements)
    registrationError.innerHTML = ''
})



document.querySelector('#logOut').addEventListener('click', e => {
    e.preventDefault()

    user = {}
    userNotes = []
    categories = []
    localStorage.removeItem('user')
    localStorage.removeItem('userNotes')
    localStorage.removeItem('categories')

    location.hash = '#login'
})

document.querySelector('#startWork').addEventListener('click', e => {
    e.preventDefault()

    emptyBoard.hidden = true
    fullBoard.hidden = false
})



document.querySelector('#addBoardBtn').addEventListener('click', () => {
    modalWindow.hidden = false
    modalTitle.innerHTML = 'Add new board'

    let newItem = true
    drawBoardForm(newItem)
})


function drawBoardForm(_newBoard) {
    modalBody.innerHTML = ''

    let form = document.createElement('form')
    form.name = 'board'

    let inputId = document.createElement('input')
    inputId.type = 'number'
    inputId.name = 'id'
    inputId.hidden = true
    form.append(inputId)

    let label = document.createElement('label')
    label.innerHTML += '<b>Title <span>*</span></b>'

    let inputName = document.createElement('input')
    inputName.type = 'text'
    inputName.placeholder = 'Enter title'
    inputName.name = 'name'
    label.append(inputName)
    form.append(label)

    let button = document.createElement('button')
    button.classList.add('myBtn')
    
    if (_newBoard) {
        button.innerHTML = 'Add board'
    } else {
        button.innerHTML = 'Save'
    }

    button.type = 'submit'
    
    form.append(button)
    modalBody.append(form)


    let formBoard = document.forms.board
    formValidation(formBoard)

    submitBoardForm()
}



function submitBoardForm() {
    let formBoard = document.forms.board

    formBoard.addEventListener('submit', e => {
        e.preventDefault()

        const idBoard = formBoard.id.value
        const newName = formBoard.name.value

        if (newName.trim() !== "") {
            modalWindow.hidden = true
            littleLoader.hidden = false

            if (!Number.isInteger(parseInt(idBoard))) {
                
                let array = categories.sort((a, b) => a.priority < b.priority ? 1 : -1)
                
                const idUser = user.id
                let priority = 0

                if (categories.length !== 0) {
                    priority = array[0].priority + 1
                } 

                addCategory({newName, idUser, priority})

            } else {
                renameCategory(parseInt(idBoard), newName)
            }
            
        }else{
            addInvalid(formBoard.name)
        }
    })
}


document.querySelector('.close').addEventListener('click', () => {
    modalWindow.hidden = true
})

window.onclick = function(event) {
    if (event.target === modalWindow) {
        modalWindow.hidden = true
    }
}


let draggableItem

function drawColumns() {
    const content = document.querySelector('.fullBoard_content')
    content.innerHTML = ''

    categories.forEach(board => {
        let column = document.createElement('div')
        column.classList.add('column')
        column.setAttribute('data-category', board.name)


        let header = document.createElement('div')
        header.classList.add('header')

        let title = document.createElement('h2')
        title.innerHTML = board.name
        header.append(title)

        let menuBtn = document.createElement('div')
        menuBtn.classList.add('menuBtn')
        menuBtn.innerHTML = '<i class="fa-solid fa-ellipsis-vertical"></i>'
        menuBtn.addEventListener('click', () => {
            modalWindow.hidden = false
            drawMenuBoard(board)
        })
        header.append(menuBtn)
        column.append(header)


        let body = document.createElement('div')
        body.setAttribute('data-category', board.name)
        body.classList.add('content')
        column.append(body)

        let footer = document.createElement('div')
        footer.classList.add('column_footer')
        let button = document.createElement('button')
        button.classList.add('addCard')
        button.innerHTML = '<i class="fa-solid fa-plus"></i> Add card'
        button.addEventListener('click', () => {
            modalWindow.hidden = false
            modalTitle.innerHTML = 'Add new event'
            let newNote = true
            drawNoteForm(newNote, board.name)
        })

        footer.append(button)
        column.append(footer)

        movingNote(column)

        content.append(column)
    })
    
    
    drawNotes()
    littleLoader.hidden = true
}


function drawNotes() {
    userNotes.forEach(note => {
        let card = document.createElement('div')
        card.classList.add('card')
        card.setAttribute('data-id', note.id)
        card.draggable = true

        let cardHeader = document.createElement('div')
        cardHeader.classList.add('card_header')

        let headerDiv_1 = document.createElement('div')
        if (note.color !== '') {
            let boxColor = document.createElement('div')
            boxColor.classList.add('colorBox')
            boxColor.style.background = note.color
            headerDiv_1.append(boxColor)
        }
        cardHeader.append(headerDiv_1)

        let h3 = document.createElement('h3')
        h3.innerHTML = note.event
        headerDiv_1.append(h3)

        let headerDiv_2 = document.createElement('div')
        
        let btnEdit = document.createElement('div')
        
        btnEdit.addEventListener('click', _e =>{
            let newNote = false
            drawNoteForm(newNote)

            let formNote = document.forms.note

            formNote.id.value = note.id
            formNote.active.value = note.active
            formNote.event.value = note.event
            formNote.startDate.value = note.startDate
            formNote.startTime.value = note.startTime
            formNote.endDate.value = note.endDate
            formNote.endTime.value = note.endTime
            formNote.color.value = note.color
            formNote.notes.value = note.notes

            modalTitle.innerHTML = 'Edit note'
            modalWindow.hidden = false
        })

        btnEdit.classList.add('edit')
        btnEdit.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>'
        headerDiv_2.append(btnEdit)
        
        let btnDelete = document.createElement('div')
        btnDelete.addEventListener('click', _e =>{
            littleLoader.hidden = false
            deleteNote(note.id)
        })
        btnDelete.classList.add('delete')
        btnDelete.innerHTML = '<i class="fa-solid fa-trash-can"></i>'
        headerDiv_2.append(btnDelete)

        cardHeader.append(headerDiv_2)


        let cardContent = document.createElement('div')
       
        cardContent.classList.add('card_content')
        cardContent.innerHTML = note.notes

        let cardFooter = document.createElement('div')
        cardFooter.classList.add('card_footer')

        if (note.endDate == '' && note.endTime == '') {
            cardFooter.innerHTML = `${note.startDate} ${note.startTime}`
        } else {
            cardFooter.innerHTML = `${note.startDate} ${note.startTime} - ${note.endDate} ${note.endTime}`
        }



        card.addEventListener('dragstart', () => {
            draggableItem = card
        })

        card.append(cardHeader)
        card.append(cardContent)
        card.append(cardFooter)

        document.querySelectorAll('.content').forEach(column => {
            if (column.dataset.category === note.active) {
                column.append(card)
            }
        })
    })
}


function movingNote(_container) {
    _container.addEventListener('dragover', e => e.preventDefault())
    _container.addEventListener('drop', e => {
        let box = e.target.closest('.column ').querySelector('.content')

        box.append(draggableItem)

        let idNote = draggableItem.dataset.id
        let active = box.dataset.category

        editNote(idNote, {active})
    })
}


function drawNoteForm(_newNote, _active) {
    modalBody.innerHTML = ''

    let form = document.createElement('form')
    form.name = 'note'

    let inputId = document.createElement('input')
    inputId.type = 'number'
    inputId.name = 'id'
    inputId.hidden = true
    form.append(inputId)

    let inputCategories = document.createElement('input')
    inputCategories.type = 'text'
    inputCategories.name = 'active'
    inputCategories.hidden = true
    form.append(inputCategories)

    let labelEvent = document.createElement('label')
    labelEvent.innerHTML = '<b>Event <span>*</span></b>'
    labelEvent.innerHTML += '<input type="text" placeholder="Enter event" name="event">'
    form.append(labelEvent)

    let labelStart = document.createElement('label')
    labelStart.innerHTML = '<b>Start</b>'

    let div_1 = document.createElement('div')
    div_1.classList.add('row')

    let inputSDate = document.createElement('input')
    inputSDate.type = 'date'
    inputSDate.name = 'startDate'
    div_1.append(inputSDate)

    let inputSTime = document.createElement('input')
    inputSTime.type = 'time'
    inputSTime.name = 'startTime'
    div_1.append(inputSTime)
    labelStart.append(div_1)
    form.append(labelStart)


    let labelEnd = document.createElement('label')
    labelEnd.innerHTML = '<b>End</b>'

    let div_2 = document.createElement('div')
    div_2.classList.add('row')

    let inputEDate = document.createElement('input')
    inputEDate.type = 'date'
    inputEDate.name = 'endDate'
    div_2.append(inputEDate)

    let inputETime = document.createElement('input')
    inputETime.type = 'time'
    inputETime.name = 'endTime'
    div_2.append(inputETime)
    labelEnd.append(div_2)
    form.append(labelEnd)


    let divColor = document.createElement('div')
    let labelColor = document.createElement('label')
    labelColor.innerHTML = '<b>Color</b> '
    labelColor.innerHTML += '<input id="color" type="color" value="#11b603" name="color">'
    divColor.append(labelColor)
    form.append(divColor)

    let labelText = document.createElement('label')
    labelText.innerHTML = '<b>Notes</b>'
    labelText.innerHTML += '<textarea name="notes" cols="30" rows="5"></textarea>'
    form.append(labelText)

    if (_newNote) {
        form.innerHTML += '<button class="myBtn" type="submit">Add event</button>'
    } else {
        form.innerHTML += '<button class="myBtn" type="submit">Save</button>'
    }
    modalBody.append(form)

    let formNote = document.forms.note
    formValidation(formNote)

    if (_active !== undefined) {
        formNote.active.value = _active
    }
    submitNoteForm()
}


function submitNoteForm() {
    let formNote = document.forms.note

    formNote.addEventListener('submit', e => {
        e.preventDefault()

        const idNotes = formNote.id.value
        const active = formNote.active.value
        const event = formNote.event.value
        const startDate = formNote.startDate.value
        const startTime = formNote.startTime.value
        const endDate = formNote.endDate.value
        const endTime = formNote.endTime.value
        const color = formNote.color.value
        const notes = formNote.notes.value

        if (/^[а-яa-z]/i.test(event)){
            modalWindow.hidden = true
            modalBody.innerHTML = ''
            littleLoader.hidden = false
            
            const userId = user.id
        
            if (!Number.isInteger(parseInt(idNotes))) {
                
                addNote({event, userId, startDate, startTime, endDate, endTime, notes, active, color})
        
            } else {
        
                editNote(idNotes, {event, startDate, startTime, endDate, endTime, notes, active, color})
        
            }

        }else{
            if (!(/^[а-яa-z]/i.test(event))) {
                addInvalid(formNote.event)
            }
        }
    })
}



function drawMenuBoard(_board) {
    modalBody.innerHTML = ''
    modalTitle.innerHTML = ''

    let div = document.createElement('div')
    div.classList.add('modal-menu')

    let moveBtn = document.createElement('button')
    moveBtn.innerHTML = 'Move board'
    moveBtn.addEventListener('click', () =>{
        modalTitle.innerHTML = 'Move board'

        drawMoveBoardForm(_board)
    })
    div.append(moveBtn)

    let renameBtn = document.createElement('button')
    renameBtn.innerHTML = 'Rename board'
    renameBtn.addEventListener('click', () =>{
        modalTitle.innerHTML = 'Rename board'

        let newBoard = false
        drawBoardForm(newBoard)

        let formBoard = document.forms.board

        formBoard.id.value = _board.id
        formBoard.name.value = _board.name
    })
    div.append(renameBtn)

    let deleteBtn = document.createElement('button')
    deleteBtn.innerHTML = 'Delete board'
    deleteBtn.addEventListener('click', () =>{
        littleLoader.hidden = false
        
        deleteCategory(_board.id, _board.name)
        modalWindow.hidden = true
    })
    div.append(deleteBtn)

    modalBody.append(div)
}



function drawMoveBoardForm(_board) {
    modalBody.innerHTML = ''

    let form = document.createElement('form')
    form.name = 'moveBoard'

    let label = document.createElement('label')
    label.innerHTML = '<b>Position</b>'

    let select = document.createElement('select')
    select.name = 'position'

    let indexMoveItem = categories.findIndex(item => item.name === _board.name)

    for (let i = 0; i < categories.length; i++) {
        let option = document.createElement('option')
        option.value = i
        if (i === indexMoveItem) {
            option.innerHTML = `${i + 1} (current)`
        } else {
            option.innerHTML = i + 1
        }

        select.append(option)
    }

    label.append(select)
    form.append(label)
    form.innerHTML +='<button class="myBtn" type="submit">Move</button>'

    modalBody.append(form)

    let formMove = document.forms.moveBoard
    formValidation(formMove)

    submitMoveBoardForm(indexMoveItem)
}


function submitMoveBoardForm(_indexItem) {
    let formMove = document.forms.moveBoard

    formMove.addEventListener('submit', e => {
        e.preventDefault()
        littleLoader.hidden = false

        let newPosition = formMove.position.value

        if (_indexItem !== parseInt(newPosition)) {
            let currentBoard = categories.splice(_indexItem, 1)
            categories.splice(newPosition, 0, currentBoard[0])

            editPriorityCategories()
        } else {
            littleLoader.hidden = true
        }

        modalWindow.hidden = true
    })
}


function editPriorityCategories() {

    let i = 0

    let requests = categories.map(category => 
        fetch(prefix + `category/${category.id}`, 
        {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                priority: i++
            }),
        })
    );

    Promise.all(requests)
        .then(() => {
            getCategoriesUser(user.id)
        })
}



function addNote(_note) {
    fetch(prefix + 'note', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            event: _note.event,
            userId: _note.userId,
            startDate: _note.startDate,
            startTime: _note.startTime,
            endDate: _note.endDate,
            endTime: _note.endTime,
            notes: _note.notes,
            active: _note.active,
            color: _note.color,
        }),
    })
    .then(() =>{
        getNotesUser(_note.userId)
    })
}


function editNote(_idNote, _note) {
    fetch(prefix + `note/${_idNote}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            event: _note.event,
            startDate: _note.startDate,
            startTime: _note.startTime,
            endDate: _note.endDate,
            endTime: _note.endTime,
            notes: _note.notes,
            active: _note.active,
            color: _note.color,
        }),
    })
    .then(() =>{
        getNotesUser(user.id)
    })
}


function getNotesUser(_idUser) {
    fetch(prefix + `note?userId=${_idUser}`)
    .then(response => response.json())
    .then(result => {
        
        userNotes = result
        localStorage.setItem('userNotes', JSON.stringify(userNotes))

        drawColumns()
    })
}


function deleteNote(_idNote) {
    fetch(prefix + `note/${_idNote}`, 
    { 
        method: 'DELETE' 
    })
    .then(() =>{
        getNotesUser(user.id)
    })
}


function addCategory(_board) {
    fetch(prefix + 'category', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: _board.newName,
            userId: _board.idUser,
            priority: _board.priority,
        }),
    })
    .then(() =>{
        getCategoriesUser(_board.idUser)
    })

}


function renameCategory(_idBoard, _nameBoard) {
    fetch(prefix + `category/${_idBoard}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: _nameBoard
        }),
    })
    .then(() =>{

        let oldNameBoard = categories.find(item => item.id === _idBoard)
        let array = userNotes.filter(item => item.active === oldNameBoard.name)

        if (array.length !== 0) {
            editActiveNotes(array, _nameBoard)
        } else {
            getCategoriesUser(user.id)
        }
    })
}


function getCategoriesUser(_idUser) {
    fetch(prefix + `category?userId=${_idUser}`)
    .then(response => response.json())
    .then(result => {
        
        categories = result.sort((a, b) => a.priority > b.priority ? 1 : -1)
        localStorage.setItem('categories', JSON.stringify(categories))

        drawColumns()
    })
}


function editActiveNotes(_array, _newActive) {
    let requests = _array.map(note => 
        fetch(prefix + `note/${note.id}`, 
        { 
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                active: _newActive,
            }),
        })
    );

    Promise.all(requests)
        .then(() => {
            getCategoriesUser(user.id)
        })
        .then(() =>{
            getNotesUser(user.id)
        })
}



function deleteCategory(_idNote, _nameBoard) {
    fetch(prefix + `category/${_idNote}`, 
    { 
        method: 'DELETE' 
    })
    .then(() =>{
        let array = userNotes.filter(item => item.active === _nameBoard)

        if (array.length !== 0) {
            deleteNotesBoard(array)
        } else {
            getCategoriesUser(user.id)
        }
    })
}

function deleteNotesBoard(_array) {
    
    let requests = _array.map(note => 
        fetch(prefix + `note/${note.id}`, 
        { 
            method: 'DELETE',
        })
    );

    Promise.all(requests)
        .then(() => {
            getCategoriesUser(user.id)
        })
        .then(() =>{
            getNotesUser(user.id)
        })
}


function showUserDate() {
    document.querySelector('#userName').innerHTML = `${user.firstName} ${user.lastName}`
    document.querySelector('#userEmil').innerHTML = `${user.email}`
    document.querySelector('#userPhone').innerHTML = `${user.phone}`

    document.querySelector("#totalBoards").innerHTML = `${categories.length}`
    document.querySelector("#totalNotes").innerHTML = `${userNotes.length}`
}


document.querySelector('#editProfile').addEventListener('click', e => {
    e.preventDefault()

    modalWindow.hidden = false
    drawProfileForm()
})


function drawProfileForm() {
    modalBody.innerHTML = ''
    modalTitle.innerHTML = 'Edit profile'

    let form = document.createElement('form')
    form.name = 'profile'

    let labelName  = document.createElement('label')
    labelName.innerHTML = '<b>Name <span>*</span></b>'

    let inputName = document.createElement('input')
    inputName.type = 'text'
    inputName.name = 'firstName'
    labelName.append(inputName)
    form.append(labelName)

    let labelLastName = document.createElement('label')
    labelLastName.innerHTML = '<b>LastName <span>*</span></b>'

    let inputLastName = document.createElement('input')
    inputLastName.type = 'text'
    inputLastName.name = 'lastName'
    labelLastName.append(inputLastName)
    form.append(labelLastName)

    let labelPhone = document.createElement('label')
    labelPhone.innerHTML = '<b>Phone </b>'

    let inputPhone = document.createElement('input')
    inputPhone.type = 'number'
    inputPhone.name = 'number'
    labelPhone.append(inputPhone)
    form.append(labelPhone)

    form.innerHTML +='<button class="myBtn" type="submit">Save</button>'
    
    modalBody.append(form)

    let formProfile = document.forms.profile

    formProfile.id.value = user.id
    formProfile.firstName.value = user.firstName
    formProfile.lastName.value = user.lastName
    formProfile.number.value = user.phone

    formValidation(formProfile)

    submitProfileForm()
}

function submitProfileForm() {
    let formProfile = document.forms.profile
    
    formProfile.addEventListener('submit', e => {
        e.preventDefault()

        let firstName = formProfile.firstName.value
        let lastName = formProfile.lastName.value
        let phone = formProfile.number.value

        if (!(/^[а-яa-z]/i.test(firstName)) || !(/^[а-яa-z]/i.test(lastName))) {

            if (!(/^[а-яa-z]/i.test(firstName))) {
                addInvalid(formProfile.firstName)
            }
    
            if (!(/^[а-яa-z]/i.test(lastName))) {
                addInvalid(formProfile.lastName)
            }
    

        }else{
           editUser({firstName, lastName, phone})
        }
    })
}


function editUser(_user) {
    fetch(prefix + `user/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: _user.firstName,
          lastName: _user.lastName,
          number: _user.phone
        }),
    })
    .then(response => {
        if (response.ok !== true) {

            addInvalid(registrationForm.email)
            throw new Error("This Email is busy, please change your Email")
        }
    })
    .then(() => {
        modalWindow.hidden = true
        getUser()
    })
    .catch(error => {
        addInvalid(registrationForm.email)
        alert(`Whoops! ${error.message}`)
    })
}


function getUser() {
    fetch(prefix + `user/${user.id}`)
    .then(response => response.json())
    .then(result => {
        
        user.email = result.email
        user.firstName = result.firstName
        user.lastName = result.lastName
        user.phone = result.number

        showUserDate()
    })
}


function showCharts() {

    let labelChart = []
    categories.forEach(item => {
        labelChart.push(item.name)
    })

    let dataChart = []
    let count = 0
    for (let i = 0; i < categories.length; i++) {
        count = userNotes.filter(note => note.active === categories[i].name).length
        dataChart.push(count)
    }

    let dataColor = randomColor(categories.length)

    
    document.querySelector(".chartBar").innerHTML = '<canvas id="myChart_2"></canvas>';
    const ctx_2 = document.getElementById('myChart_2').getContext('2d');
    const chartBar = new Chart(ctx_2, {
        type: 'bar',
        data: {
            labels: labelChart,
            datasets: [{
                label: 'Number of notes',
                data: dataChart,
                backgroundColor: dataColor,
                borderColor: dataColor,
                borderWidth: 2
            }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Bar Chart',
                }
            }
        }
    });


    document.querySelector(".chartDoughnut").innerHTML = '<canvas id="myChart_1"></canvas>';
    const ctx_1 = document.getElementById('myChart_1').getContext('2d');
    const chartDoughnut = new Chart(ctx_1, {
        type: 'doughnut',
        data: {
            labels: labelChart,
            datasets: [{
                label: 'Number of notes',
                data: dataChart,
                backgroundColor: dataColor,
                hoverOffset: 4
            }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                  display: true,
                  position: "left",
                },
                title: {
                    display: true,
                    text: 'Doughnut Chart',
                }
            }
        }
    });
}


function randomColor(n) {
    let answer = []
    let random

    for (let i = 0; i < n; i++) {
        do {
            random = Math.floor(Math.random()*16777215).toString(16)
        } while (answer.includes(n));

        answer.push(`#${random}`)
    }
    return answer
}



const forms = document.forms

for (let i = 0; i < forms.length; i++) {
    formValidation(forms[i])
}

function formValidation(_form) {
    _form.addEventListener('focus', e => {
        addFocus(e.target)
    }, true)

    _form.addEventListener('blur', e => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
            e.target.classList.remove('focus');
        }
    }, true);
}


function addInvalid(item) {
    if (item.tagName === 'INPUT' || item.tagName === 'TEXTAREA') {
        item.classList.add('invalid');
    }
}


function addFocus(item) {
    if (item.tagName === 'INPUT' || item.tagName === 'TEXTAREA' || item.tagName === 'SELECT') {
        item.classList.remove('invalid')
        item.classList.add('focus');
    }
}


function clearForm(_elements) {
    for (let i = 0; i < _elements.length; i++) {
        _elements[i].classList.remove('invalid')
    }
}


// const scrollContainer = document.querySelector("#horizontal-scroller")

// scrollContainer.addEventListener("wheel", (evt) => {
//     evt.preventDefault();
//     scrollContainer.scrollLeft += evt.deltaY;
// });

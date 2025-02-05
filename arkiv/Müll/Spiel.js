const dragItem = document.getElementById('dragItem');
const targets = document.querySelectorAll('.target');
const correctTargetId = 'target2';


dragItem.addEventListener('dragstart', dragStart);
dragItem.addEventListener('dragend', dragEnd);

targets.forEach(target => {
    target.addEventListener('dragover', dragOver);
    target.addEventListener('dragenter', dragEnter);
    target.addEventListener('dragleave', dragLeave);
    target.addEventListener('drop', dragDrop);
});

function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
    setTimeout(() => {
        e.target.classList.add('hide');
    }, 0);
}

function dragEnd(e) {
    e.target.classList.remove('hide');
}

function dragOver(e) {
    e.preventDefault();
}

function dragEnter(e) {
    e.preventDefault();
    e.target.classList.add('hovered');
}

function dragLeave(e) {
    e.target.classList.remove('hovered');
}

function dragDrop(e) {
    e.target.classList.remove('hovered');
    const id = e.dataTransfer.getData('text/plain');
    const draggable = document.getElementById(id);
    e.target.appendChild(draggable);
    if (e.target.id === correctTargetId) {
        alert('korrekt');
    }
}
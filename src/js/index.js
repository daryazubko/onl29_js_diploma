const lists = document.querySelectorAll(".list");
const addColumnButton = document.querySelector(".add_new_column");

const getRandomColorById = (id) => {
  const r = ((id * 14 + 13) * 7) % 256;
  const g = ((id * 45 + 5) * 9) % 256;
  const b = ((id * 31 + 17) * 11) % 256;
  return `rgba(${r},${g},${b}, .5)`;
};

const saveBoard = () => {
  localStorage.setItem("board", JSON.stringify(boardsList));
};

const loadBoard = () => {
  const boardString = localStorage.getItem("board");
  if (!boardString) {
    return [
      {
        id: 1,
        title: "TODO",
        cards: [],
      },
      {
        id: 2,
        title: "IN PROGRESS",
        cards: [],
      },
      {
        id: 3,
        title: "DONE",
        cards: [],
      },
    ];
  }
  const board = JSON.parse(boardString);
  return board;
};

const boardsList = loadBoard();

const renderBoardStructure = () => {
  saveBoard();
  const itemsWrapper = document.querySelector(".items-wrapper");
  itemsWrapper
    .querySelectorAll(".app-body_item")
    .forEach((item) => item.remove());
  boardsList.forEach((board) => {
    const column = document.createElement("div");
    column.classList.add("app-body_item");
    column.id = "column-" + board.id;
    column.addEventListener("drop", (event) => onDrop(event, board.id));
    column.addEventListener("dragover", (event) => onDragOver(event, board.id));
    column.style.backgroundColor = getRandomColorById(board.id);
    column.innerHTML = `
          <span class="title" contenteditable="true">${board.title}</span>
          <div class="list">
            ${board.cards.reduce(
              (acc, card) =>
                acc +
                `
              <div class="list_item" onclick="onCardClick(event, ${board.id}, ${card.id})" ondragend="onDragEnd(event);" ondragstart="onDragStart(event, ${board.id}, ${card.id});"  draggable="true">${card.title}</div>
            `,
              ""
            )}
          </div>
          <div class="form">
            <textarea class="textarea" placeholder="Введите название для карточки"> </textarea>
            <div class="buttons">
              <button class="add_item-btn">Добавить карточку</button>
              <button class="cancel_item-btn">Отмена</button>
            </div>
          </div>
          <div class="add_btn" onclick="addNewTask(${
            board.id
          })"><span>+</span>Добавить карточку</div>`;
    itemsWrapper.insertBefore(column, addColumnButton);
  });
};
renderBoardStructure();

function currentTime() {
  var date = new Date();
  var hour = date.getHours();
  var min = date.getMinutes();
  var sec = date.getSeconds();
  hour = updateTime(hour);
  min = updateTime(min);
  sec = updateTime(sec);
  document.getElementById("clock").innerText = hour + " : " + min + " : " + sec;
  var t = setTimeout(function () {
    currentTime();
  }, 1000);
}

function updateTime(k) {
  if (k < 10) {
    return "0" + k;
  } else {
    return k;
  }
}

currentTime();

function addNewColumn() {
  boardsList.push({
    id: boardsList.length + 1,
    title: "New Column",
    cards: [],
  });
  renderBoardStructure();
}

function addNewTask(id) {
  const column = document.querySelector(`#column-${id}`);
  const form = column.querySelector(`.form`);
  const btn = column.querySelector(`.add_btn`);
  const addBtn = column.querySelector(`.add_item-btn`);
  const textarea = column.querySelector(".textarea");
  const cancelBtn = column.querySelector(".cancel_item-btn");

  let value = "";
  form.style.display = "block";
  btn.style.display = "none";
  addBtn.style.display = "none";

  const addBtnEventHandler = () => {
    if (id !== 2) return addBtnEvent();
    const boardItemsCount = boardsList.find((board) => board.id === id).cards
      .length;
    if (boardItemsCount < 4) return addBtnEvent();
    onOpenWarnPopup(() => addBtnEvent());
  };
  const addBtnEvent = () => {
    console.log("added");
    const columnItem = boardsList.find((el) => el.id === id);
    columnItem.cards.push({
      id: columnItem.cards.length + 1,
      title: value,
    });

    textarea.value = "";
    value = "";
    form.style.display = "none";
    btn.style.display = "flex";
    renderBoardStructure();
  };

  const textareaEvent = (e) => {
    value = e.target.value;
    if (value) {
      addBtn.style.display = "block";
    } else {
      addBtn.style.display = "none";
    }
  };

  const cancelBtnEvent = () => {
    textarea.value = "";
    value = "";
    form.style.display = "none";
    btn.style.display = "flex";
    addBtn.removeEventListener("click", addBtnEvent);
    textarea.removeEventListener("input", textareaEvent);
    cancelBtn.removeEventListener("click", cancelBtnEvent);
  };

  textarea.addEventListener("input", textareaEvent);
  addBtn.addEventListener("click", addBtnEventHandler);
  cancelBtn.addEventListener("click", cancelBtnEvent);
}

let dragBoard = null;
let dragCard = null;

const onDragStart = (e, startBoard, cardId) => {
  e.dataTransfer.dropEffect = "move";
  console.log("dragstarted", startBoard, cardId);
  dragBoard = startBoard;
  dragCard = cardId;
};

const onDragEnd = (e) => {
  dragBoard = null;
  dragCard = null;
};

function onDragOver(ev, boardId) {
  ev.preventDefault();
  ev.dataTransfer.dropEffect = "move";
}

function onDrop(ev, boardId) {
  ev.preventDefault();
  const dragBoardCopy = dragBoard;
  const dragCardCopy = dragCard;
  if (dragBoardCopy === boardId) return;

  const moveCards = () => {
    const dragBoardItem = boardsList.find(
      (board) => board.id === dragBoardCopy
    );
    const dropBoardItem = boardsList.find((board) => board.id === boardId);
    const dropCard = {
      ...dragBoardItem.cards.find((card) => card.id === dragCardCopy),
    };
    const maxId = dropBoardItem.cards.reduce((acc, card) => Math.max(acc, card.id), -1);
    dropCard.id = maxId + 1;
    dropBoardItem.cards.push(dropCard);
    dragBoardItem.cards = dragBoardItem.cards.filter(
      (card) => card.id !== dragCardCopy
    );
  };
  if (boardId !== 2) {
    moveCards();
    renderBoardStructure();
    return;
  }
  const dropBoardItemsCount = boardsList.find((board) => board.id === boardId)
    .cards.length;
  if (dropBoardItemsCount >= 3) {
    onOpenWarnPopup(moveCards);
  } else {
    moveCards();
  }
  renderBoardStructure();
}

const onCardClick = (event, boardId, cardId) => {
  const boardCards = boardsList.find((board) => board.id === boardId);
  const cards = boardCards.cards;
  const card = cards.find((card) => card.id === cardId);
  onOpenEditCardPopup(boardId, cardId);
};

const onOpenEditCardPopup = (boardId, cardId) => {
  const popup = document.querySelector(".edit-card-popup");
  popup.style.display = "flex";
  const editBtn = popup.querySelector('.submit-btn');
  const deleteBtn = popup.querySelector('.delete-btn');
  const cancelBtn = popup.querySelector('.cancel-btn');
  const textarea = popup.querySelector('textarea');
  const board = boardsList.find((board) => board.id === boardId);
  const card = board.cards.find((card) => card.id === cardId);
  textarea.value = card.title;

  const cancelHandler = () => {
    editBtn.removeEventListener('click', editHandler);
    deleteBtn.removeEventListener('click', deleteHandler);
    cancelBtn.removeEventListener('click', cancelHandler);
  }
  const deleteHandler = () => {
    board.cards = board.cards.filter((card) => card.id !== cardId);
    cancelHandler();
    renderBoardStructure();
    onCloseEditCardPopup();
  }
  const editHandler = () => {
    card.title = textarea.value;
    cancelHandler();
    renderBoardStructure();
    onCloseEditCardPopup();
  }
  editBtn.addEventListener('click', editHandler);
  deleteBtn.addEventListener('click', deleteHandler);
  cancelBtn.addEventListener('click', cancelHandler);
}

const onCloseEditCardPopup = () => {
  const popup = document.querySelector(".edit-card-popup");
  popup.style.display = "none";
}

const onCloseWarnPopup = () => {
  const popup = document.querySelector(".warning-popup-in-progress");
  popup.style.display = "none";
};

const onOpenWarnPopup = (callback) => {
  const popup = document.querySelector(".warning-popup-in-progress");
  popup.style.display = "flex";
  const submitBtn = popup.querySelector(".submit-btn");
  const submitEvent = () => {
    callback();
    console.log("SUBMIT");
    onCloseWarnPopup();
    renderBoardStructure();
    submitBtn.removeEventListener("click", submitEvent);
  };
  submitBtn.addEventListener("click", submitEvent);
};

// ------------------------------------------

// let draggedItem = null;

// function dragNdrop() {
//   const listItems = document.querySelectorAll(".list_item");
//   const lists = document.querySelectorAll(".list");

//   for (let i = 0; i < listItems.length; i++) {
//     const item = listItems[i];

//     item.addEventListener("dragstart", () => {
//       draggedItem = item;
//       setTimeout(() => {
//         item.style.display = "none";
//       }, 0);
//     });
//     item.addEventListener("dragend", () => {
//       setTimeout(() => {
//         item.style.display = "block";
//         draggedItem = null;
//       }, 0);
//     });
//     item.addEventListener("dblclick", () => {
//       item.remove();
//     });

//     for (let j = 0; j < lists.length; j++) {
//       const list = lists[j];
//       list.addEventListener("dragover", (e) => e.preventDefault());
//       list.addEventListener("dragend", function (e) {
//         e.preventDefault();
//         this.style.backgroundColor = "rgba(0,0,0,0.3)";
//       });
//       list.addEventListener("dragleave", function (e) {
//         this.style.backgroundColor = "rgba(0,0,0,0)";
//       });
//       list.addEventListener("drop", function (e) {
//         this.style.backgroundColor = "rgba(0,0,0,0)";
//         this.append(draggedItem);
//       });
//     }
//   }
// }
// dragNdrop();

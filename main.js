const COLOR = [
  "black",
  "blue",
  "green",
  "red",
  "purple",
  "skyblue",
  "olive",
  "brown",
];

//게임시작 버튼
const btnGameStart = document.querySelector("#btnGameStart");
const inputRow = parseInt(document.querySelector("#inputRow").value);
const inputCol = parseInt(document.querySelector("#inputCol").value);

//지뢰 15% 랜덤 생성 => 배열
let mine = new Array();
for (let i = 0; i < Math.floor(inputRow * inputCol * 0.15); i++) {
  let cell = Math.floor(Math.random() * inputRow * inputCol);
  if (mine.indexOf(cell) === -1) mine.push(cell);
  else i--;
}
btnGameStart.addEventListener("click", () => {
  btnGameStart.innerHTML = "재시작";

  //동적 테이블 생성
  let mineBoard = "";
  mineBoard += '<table class="table table-bordered text-center">';
  for (let row = 1; row <= inputRow; row++) {
    mineBoard += "<tr>";
    for (let col = 1; col <= inputCol; col++) {
      mineBoard += '<td class="mineBoardCell"></td>';
    }
    mineBoard += "</tr>";
  }
  mineBoard += "</table>";
  document.querySelector(".mineBoard").innerHTML = mineBoard;

  //셀에 지뢰 심어주기
  const mineBoardCell = document.querySelectorAll(".mineBoardCell");
  for (let i = 0; i < mineBoardCell.length; i++) {
    if (mine.indexOf(i) !== -1) {
      mineBoardCell[i].classList.add("mined");
    }
  }

  //Cell 클릭 이벤트
  for (let cell = 0; cell < mineBoardCell.length; cell++) {
    mineBoardCell[cell].addEventListener("click", function () {
      let arounds = calculateAround(cell, inputRow, inputCol);
      // 우클릭 이벤트
      if (mineBoardCell[cell].className.includes("flag")) {
        // 깃발 누르면 반응 없어야 한다.
        return false;
      } else if (mineBoardCell[cell].className.includes("mined")) {
        // 지뢰 누르면 게임이 끝난다.
        mineBoardCell[cell].innerHTML = "💣";
        mineBoardCell[cell].classList.add("table-white");
        // Promise => 폭탄이 터진 후 게임 종료를 구현하기 위함
        let defeatPromise = new Promise((resolve) => {
          setTimeout(function () {
            resolve("GAME OVER!");
          }, 250);
        });
        defeatPromise.then((successMessage) => {
          alert(successMessage);
          location.reload();
        });
      } else if (
        // 깃발도 지뢰도 아닌 블록을 클릭하면
        !mineBoardCell[cell].className.includes("flag") &&
        !mineBoardCell[cell].className.includes("mined")
      ) {
        clickSafeCell(mineBoardCell, cell, arounds);
      }
    });

    mineBoardCell[cell].addEventListener("auxclick", function () {
      // 좌클릭 이벤트 => 깃발 꼽기
      mineBoardCell[cell].addEventListener("contextmenu", function (e) {
        // 좌클릭 메뉴창 이벤트 막기
        e.preventDefault();
      });
      if (mineBoardCell[cell].className.includes("flag")) {
        mineBoardCell[cell].classList.remove("flag");
        mineBoardCell[cell].innerHTML = "";
        return false;
      } else if (mineBoardCell[cell].className.includes("safe")) {
        return false;
      }
      mineBoardCell[cell].classList.add("flag");
      mineBoardCell[cell].innerHTML = "🚩";
    });
  }
});

// Function
function calculateAround(cell, inputRow, inputCol) {
  if (cell === 0) return [1, inputCol, inputCol + 1];
  if (cell === inputCol - 1)
    // Index가 0부터 시작하므로 마지막 열은 9
    return [inputCol - 2, 2 * inputCol - 2, 2 * inputCol - 1];
  if (cell === inputCol * (inputRow - 1))
    return [
      inputCol * (inputRow - 2),
      inputCol * (inputRow - 2) + 1,
      inputCol * (inputRow - 1) + 1,
    ];
  if (cell === inputCol * inputRow - 1)
    return [
      inputCol * (inputRow - 1) - 2,
      inputCol * (inputRow - 1) - 1,
      inputCol * inputRow - 2,
    ];
  if (0 < cell && cell < inputCol - 1)
    return [
      cell - 1,
      cell + 1,
      cell + inputCol - 1,
      cell + inputCol,
      cell + inputCol + 1,
    ];
  if (inputCol * (inputRow - 1) < cell && cell < inputCol * inputRow - 1)
    return [
      cell - inputCol - 1,
      cell - inputCol,
      cell - inputCol + 1,
      cell - 1,
      cell + 1,
    ];
  if (cell % inputCol === 0)
    return [
      cell - inputCol,
      cell - inputCol + 1,
      cell + 1,
      cell + inputCol,
      cell + inputCol + 1,
    ];
  if (cell % inputCol === inputCol - 1)
    return [
      cell - inputCol - 1,
      cell - inputCol,
      cell - 1,
      cell + inputCol - 1,
      cell + inputCol,
    ];
  return [
    cell - inputCol - 1,
    cell - inputCol,
    cell - inputCol + 1,
    cell - 1,
    cell + 1,
    cell + inputCol - 1,
    cell + inputCol,
    cell + inputCol + 1,
  ];
}

function clickSafeCell(mineBoardCell, cell, arounds) {
  let count = arounds.filter((mineIndex) => mine.includes(mineIndex)).length; // 주변 지뢰개수
  if (count === 0) {
    mineBoardCell[cell].classList.add("safe");
    mineBoardCell[cell].style.color = COLOR[count];
    mineBoardCell[cell].innerHTML = count;
    mineBoardCell[cell].classList.add("table-info");
    for (let i = 0; i < arounds.length; i++) {
      // 주변을 도는데
      if (
        !mineBoardCell[arounds[i]].className.includes("safe") && // safe도 아니며,
        !mineBoardCell[arounds[i]].className.includes("flag") && // 깃발도 없고
        !mineBoardCell[arounds[i]].className.includes("mined") // 지뢰도 없다면,
      ) {
        mineBoardCell[arounds[i]].classList.add("safe");
        clickSafeCell(
          mineBoardCell,
          arounds[i],
          calculateAround(arounds[i], inputRow, inputCol)
        );
      }
    }
  } else if (count > 0) {
    mineBoardCell[cell].classList.add("safe");
    mineBoardCell[cell].style.color = COLOR[count];
    mineBoardCell[cell].innerHTML = count;
    mineBoardCell[cell].classList.add("table-info");

    let countFlag = 0;
    arounds.forEach((around) => {
      if (mineBoardCell[around].className.includes("flag")) {
        if (!mine.includes(around)) return false;
        countFlag++;
      }
    });
    if (count === countFlag) {
      arounds.forEach((around) => {
        let doubleCheckArounds = calculateAround(around, inputRow, inputCol);
        let doubleCheckCount = doubleCheckArounds.filter((mineIndex) =>
          mine.includes(mineIndex)
        ).length;
        if (!mineBoardCell[around].className.includes("flag")) {
          mineBoardCell[around].classList.add("safe");
          mineBoardCell[around].style.color = COLOR[doubleCheckCount];
          mineBoardCell[around].innerHTML = doubleCheckCount;
          mineBoardCell[around].classList.add("table-info");
        }
      });
    }
  }
  let safeCount = document.querySelectorAll(".safe");
  if (
    safeCount.length ===
    inputRow * inputCol - Math.floor(inputRow * inputCol * 0.15)
  ) {
    let victoryPromise = new Promise((resolve) => {
      setTimeout(function () {
        resolve("승리하였습니다!");
      }, 250);
    });

    victoryPromise.then((successMessage) => {
      alert(successMessage);
    });
  }
}

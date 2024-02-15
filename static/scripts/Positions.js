let current_page = [];    // массив текущих страниц
current_page[0] = 0;            // текущая страница таблицы СписокДолжностей
let page_size = [];       // массив чисел показываемых строк таблиц
page_size[0] = 5;               // начальное значение показываемых строк таблицы СписокДолжностей
let pages = [];           // массив массивов самих страниц таблиц
pages[0] = [];                  // массив самих страниц таблицы СписокДолжностей
let number_of_pages = window.innerWidth< 1360 ? 8 : 12;
                                // Число (иконок страниц + иконок многоточий+1) в пагинации (не менее 8, четное)
let my_string;                  // Выбранная строка таблицы СписокДолжностей
let button_id = null;      // Тип вызова модального окна

let position_data = position_data1;   // Все должности

let url_positions_api = 'http://127.0.0.1:8000/api/positions_api/'; // URL API для данных (Список должностей)

// Закрепление элементов при изменении масштаба и изменение пагинации
window.onload = function() {table_resize(); pagination_resize(); };
addEventListener("resize", () => { table_resize(); pagination_resize(); })

// Обновление данных
async function update_data() {
    try {
        let res = await fetch(url_positions_api);
        position_data = await res.json();
    } catch (err) {
        position_data = null;
        document.getElementById("pagination").hidden = true
        if (!document.querySelector('.no_data')) {
        insert_new_element(create_element("h3", {"classList":["text-center","no_data"],
            "textContent": "Данные не найдены или нет соединения с сервером"}), "table_for_data", 0, "afterend");
        }
        try {
            // выключить дополнительные кнопки
            do_special_actions();
        }
        catch (e) { }
        console.log("no positions")
    }
}

get_data_to_page().catch(function (err) {console.log(err)});

async function get_data_to_page(page_number) {
    // Обновить данных
    await update_data();
    if (position_data === null) {
        clear_table_and_hide_pagination(1, ".page_data", 'table_for_data', 'pagination');
        if (!document.querySelector('.no_data')) {
        insert_new_element(create_element("h3", {"classList":["text-center","no_data"],
            "textContent": "Данные не найдены"}), "table_for_data", 0, "afterend");
        }
        try {
            // выключить дополнительные кнопки
            do_special_actions();
        }
        catch (e) { }
    } else {
        filtered_user_data1 = position_data;
        let val = 0; let date = 0;

        if (page_number === undefined) page_number = 0;

        // наличие сортировки
        if (document.querySelector(".bi")) {
            val = document.querySelector(".bi").closest('th')
            date = document.querySelector(".bi");
        }

        // Если пагинация выключена - установить размер страницы по размеру массива
        page_size[0] = document.getElementById('toggleCheck').checked
            ? document.getElementById("show_by_0").options[document.getElementById("show_by_0").selectedIndex].value
            : filtered_user_data1.length;

        // если сортировка была, вернуть ее и отсортировать массив
        if (typeof val !== "number") {
            if (!document.querySelector(".bi"))
                document.getElementById(val.id).insertAdjacentElement("beforeend", date);
            sort_array(filtered_user_data1, document.querySelector(".bi").closest('th').id, !document.querySelector('.bi-arrow-up'));
        }
        // Добавить возможность сортировки, если ее еще нет
        add_sorting();

        // разбивка на страницы
        let filtered_user_data = [];
        filtered_user_data[0] = filtered_user_data1;
        for (let i = 0; i < filtered_user_data.length; i++) {
            // нарезать данные (создать массив массивов данных)
            pages[i] = paginate(filtered_user_data[i], page_size[i]);

            // открыть первую страницу таблицы
            change_page(i, parseInt(page_number));
        }
    }
}

get_data_to_page(0).then(() => {
    // включить пагинацию
    if (document.getElementById('toggleCheck'))
        document.getElementById('toggleCheck').checked = true;
}).catch(function (err) {
    console.log(err)
});

// Сменить страницу
function change_page(pagination_number, page_number) {
    // сделать текущий номер страницы = переданному значению
    current_page[pagination_number] = page_number;

    // если массив страниц не пуст - удалить старые иконки страниц
    if (pages[pagination_number].length !== 0)
        document.querySelectorAll('.page-list-' + pagination_number).forEach(el => {
            el.remove()
        });

    // добавить пагинацию
    add_pagination(number_of_pages, pagination_number, page_number);
    // Добавить возможность сортировки, если ее еще нет
    add_sorting();

    // отрисовать страницу таблицы СписокДолжностей
    if (pagination_number === 0) {
        print_rows(pages[pagination_number][page_number]);
        // выключить дополнительные кнопки
        do_special_actions();
    }
}

// Выключить дополнительные кнопки
function do_special_actions(){
    if (!document.getElementById("change_position_button").classList.contains("disabled"))
        document.getElementById("change_position_button").classList.add("disabled");
    if (!document.getElementById("delete_position_button").classList.contains("disabled"))
        document.getElementById("delete_position_button").classList.add("disabled");
}

// Отрисовка строк таблицы СписокДолжностей
function print_rows(arr) {
    clear_table_and_hide_pagination(1, ".page_data", 'table_for_data', 'pagination');
    // если массив существует
    if (arr) {
        if (arr.length !== 0) {
            // отобразить спрятанные таблицу, удалив заглушку об отсутствующих данных, если она существует
            if (document.querySelector('.no_data'))
                document.querySelector('.no_data').remove();
            document.getElementById('table_for_data').hidden = false;
            document.getElementById("pagination").hidden = false;

            // создать строчки таблицы
            arr.forEach(element => {
                let oRow = document.createElement('tr');

                oRow.dataset.t_position_id = element["t_position_id"];
                oRow.dataset.t_position_name = element["t_position_name"];

                oRow.insertCell().textContent = element["t_position_name"];

                document.querySelector(".page_data").append(oRow);
            });
        }
        // иначе отрисовать заглушку об отсутствующих данных, если ее еще нет
        else if (!document.querySelector('.no_data'))
            insert_new_element(create_element("h3", {
                "classList": ["text-center", "no_data"],
                "textContent": "Данные не найдены"
            }), "table_for_data", 0, "afterend");
    }
    // иначе отрисовать заглушку об отсутствующих данных, если ее еще нет
    else if (!document.querySelector('.no_data'))
        insert_new_element(create_element("h3", {"classList":["text-center","no_data"],
            "textContent": "Данные не найдены"}), "table_for_data", 0, "afterend");
}

// Выбор определенной должности
document.getElementById('page_data').addEventListener("click", event => {
    if (my_string)
        delete my_string.dataset.selected;

    (my_string = event.target.closest('tr')).dataset.selected = true;

    // включить кнопки

    document.getElementById("delete_position_button").dataset.t_position_id = my_string.dataset.t_position_id;
    document.getElementById("change_position_button").dataset.t_position_id = my_string.dataset.t_position_id;
    if (parseInt(my_string.dataset.t_position_id) < 100000) {
        if (document.getElementById("delete_position_button").classList.contains("disabled"))
            document.getElementById("delete_position_button").classList.remove("disabled");
        if (document.getElementById("change_position_button").classList.contains("disabled"))
            document.getElementById("change_position_button").classList.remove("disabled");
    }
    else {
        if (!document.getElementById("delete_position_button").classList.contains("disabled"))
            document.getElementById("delete_position_button").classList.add("disabled");
        if (!document.getElementById("change_position_button").classList.contains("disabled"))
            document.getElementById("change_position_button").classList.add("disabled");
    }
});

// Вызов формы "Запись" для добавления данных
document.getElementById("add_position_button").addEventListener("click", () => {
    // Обнулить валидацию
    document.querySelectorAll(".was-validated").forEach(el => {
        el.classList.remove('was-validated')
    })
    // очистить поля в модальном окне
    document.getElementById("add_data").querySelectorAll('[name]').forEach(item => {
        item.value = "";
    });

    if (my_string) {
        // очистить dataset
        Object.keys(my_string.dataset).forEach(el => {
            delete my_string.dataset[el];
        });
    }

    // и выключить кнопки
    do_special_actions();
});

// Вызов формы "Запись" для изменения данных
document.getElementById("change_position_button").addEventListener("click", () => {
    // Обнулить валидацию
    document.querySelectorAll(".was-validated").forEach(el => {
        el.classList.remove('was-validated')
    })
    position_data.forEach((oItem) => {
        if (oItem["t_position_id"] === parseInt(my_string.dataset.t_position_id)) {
            my_string.dataset.t_position_id = oItem["t_position_id"];
            my_string.dataset.t_position_name = oItem["t_position_name"];
        }
    });

    document.getElementById("add_data").querySelectorAll('[name]').forEach(item => {
        // поле либо пустое, либо содержит значение
        item.value = my_string.dataset[item.name] === "null" ? "" : my_string.dataset[item.name];
    })
});

// Определить тип вызова модального окна
document.getElementById('modal_window').addEventListener('shown.bs.modal', event => {
    button_id = event.relatedTarget.id;
});

// Поиск в отфильтрованном массиве
function searchFor() {
    let toSearch = document.getElementById("search_filter").value.toLowerCase();
    if (position_data !== null) {
        let results = position_data.filter(object => Object.values(object).some(i => i ? i.toString().toLowerCase().includes(toSearch) : false));
        print_rows(results)
    }
}

let csrftoken = getCookie('csrftoken');

let form = document.getElementById('form_wrapper');

form.addEventListener('submit', event => {
    document.getElementById('search_filter').value = "";
    if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
    } else {
        event.preventDefault();

        // Если вызвавшая модальное окно кнопка - Добавить - добавить новую запись
        if (button_id === "add_position_button") {
            button_id = null

            let map_positions = new Map();
            // собрать значения полей в мап
            document.getElementById("add_data").querySelectorAll('[name]').forEach(item => {
                map_positions.set(item.name, item.value);
            });

            let sent_data = {
                "t_position_name": map_positions.get("t_position_name"),
            };
            fetch('http://127.0.0.1:8000/api/positions_api/create/', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                body: JSON.stringify(sent_data)
            })
                .then(function () {
                    get_data_to_page().catch(function (err) {console.log(err)});
                })
        }
        if (button_id === "change_position_button") {
            button_id = null

            let map_positions = new Map();
            // собрать значения полей в мап
            document.getElementById("add_data").querySelectorAll('[name]').forEach(item => {
                map_positions.set(item.name, item.value);
            });

            let sent_data = {
                "t_position_id": my_string.dataset.t_position_id,
                "t_position_name": map_positions.get("t_position_name"),
            };
            fetch('http://127.0.0.1:8000/api/positions_api/update/', {
                method: 'PUT',
                headers: {
                    'Content-type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                body: JSON.stringify(sent_data)
            })
                .then(function () {
                    get_data_to_page().catch(function (err) {console.log(err)});
                })
        }

        let myModalEl = document.getElementById('modal_window');
        let modal = bootstrap.Modal.getInstance(myModalEl);
        modal.hide();
    }
    document.querySelectorAll(".want-valid").forEach(el => {
        el.classList.add('was-validated')
    })
})

// Удалить данные
document.getElementById("yes_delete_button").addEventListener("click", () => {
    document.getElementById('search_filter').value = "";
    let sent_data = {
        "t_position_id":parseInt(my_string.dataset.t_position_id),
    };
    fetch('http://127.0.0.1:8000/api/positions_api/delete/', {
        method:'DELETE',
        headers:{
            'Content-type':'application/json',
            'X-CSRFToken':csrftoken,
        },
        body: JSON.stringify(sent_data)
    })
        .then(() => {
            get_data_to_page().catch(function (err) {console.log(err)});
        })
});
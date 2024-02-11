let current_page = [];    // массив текущих страниц
current_page[0] = 0;            // текущая страница таблицы СписокСотрудников
let page_size = [];       // массив чисел показываемых строк таблиц
page_size[0] = 5;               // начальное значение показываемых строк таблицы СписокСотрудников
let pages = [];           // массив массивов самих страниц таблиц
pages[0] = [];                  // массив самих страниц таблицы СписокСотрудников
let number_of_pages = window.innerWidth< 1360 ? 8 : 12;
                                // Число (иконок страниц + иконок многоточий+1) в пагинации (не менее 8, четное)
let my_string;                  // Выбранная строка таблицы СписокСотрудников
let button_id = null;      // Тип вызова модального окна

let employee_data = employee_data1;   // Все сотрудники
let position_data = position_data1;   // Все должности

let url_employees_api = 'http://127.0.0.1:8000/api/employees_api/'; // URL API для данных (Список должностей)
let url_positions_api = 'http://127.0.0.1:8000/api/positions_api/'; // URL API для данных (Список должностей)

// Создание масок для вывода даты и даты/времени
const FMT_DATE = new Intl.DateTimeFormat('ru', {day: '2-digit', month: '2-digit', year: 'numeric'});
Object.defineProperties(Date.prototype, {
    //дата без времени
    'date': {
        get: function () {
            return (this) ? FMT_DATE.format(this).replace(',', '') : ''
        },
    },
});

// Закрепление элементов при изменении масштаба и изменение пагинации
window.onload = function() {table_resize(); pagination_resize(); };
addEventListener("resize", () => { table_resize(); pagination_resize(); })

generate_position_datalist(position_data);

// Обновление данных
async function update_data() {
    let res = await fetch(url_positions_api);
    try {
        position_data = await res.json();
    } catch (err) {
        position_data = null;
        console.log("no positions")
    }
    res = await fetch(url_employees_api);
    try {
        employee_data = await res.json();
    } catch (err) {
        employee_data = null;
        console.log("no employees")
    }
}

get_data_to_page().catch(function (err) {console.log(err)});

async function get_data_to_page(page_number) {
    // Обновить данных
    await update_data();
    if (employee_data === null) {
        clear_table_and_hide_pagination(0, ".page_data", 'table_for_data');
        if (!document.querySelector('.no_data')) {
        insert_new_element(create_element("h3", {"classList":["text-center","no_data"],
            "textContent": "Данные не найдены"}), "table_for_data", 0, "afterend");
        }
    } else {
        filtered_user_data1 = employee_data;
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
    document.getElementById('toggleCheck').checked = true;
}).catch(function (err) {
    console.log(err)
});

// Сменить страницу
function change_page(pagination_number, page_number) {
    // сделать текущий номер страницы = переданному значению
    current_page[pagination_number] = page_number;
    // get_data_to_page(page_number)

    // если массив страниц не пуст - удалить старые иконки страниц
    if (pages[pagination_number].length !== 0)
        document.querySelectorAll('.page-list-' + pagination_number).forEach(el => {
            el.remove()
        });

    // добавить пагинацию
    add_pagination(number_of_pages, pagination_number, page_number);
    // Добавить возможность сортировки, если ее еще нет
    add_sorting();

    // отрисовать страницу таблицы СписокСотрудников
    if (pagination_number === 0) {
        print_rows(pages[pagination_number][page_number]);
        // выключить дополнительные кнопки
        do_special_actions();
    }
}

// Выключить дополнительные кнопки
function do_special_actions(){
    if (!document.getElementById("change_employee_button").classList.contains("disabled"))
        document.getElementById("change_employee_button").classList.add("disabled");
    if (!document.getElementById("delete_employee_button").classList.contains("disabled"))
        document.getElementById("delete_employee_button").classList.add("disabled");
}

// Отрисовка строк таблицы СписокСотрудников
function print_rows(arr) {
    clear_table_and_hide_pagination(0, ".page_data", 'table_for_data');
    // если массив существует
    if (arr) {
        // отобразить спрятанные таблицу, удалив заглушку об отсутствующих данных, если она существует
        if (document.querySelector('.no_data'))
            document.querySelector('.no_data').remove();
        document.getElementById('table_for_data').hidden = false;

        // создать строчки таблицы
        arr.forEach(element => {
            let oRow = document.createElement('tr');

            oRow.dataset.t_employees_id = element["t_employees_id"];
            oRow.dataset.t_employees_last_name = element["t_employees_last_name"];
            oRow.dataset.t_employees_first_name = element["t_employees_first_name"];
            oRow.dataset.t_employees_patronymic = element["t_employees_patronymic"];
            oRow.dataset.t_employees_birth_date = element["t_employees_birth_date"];
            oRow.dataset.t_employees_position = element["t_employees_position"];
            oRow.dataset.t_position_name = element["t_position_name"];
            oRow.dataset.t_employees_residential_address = element["t_employees_residential_address"];

            oRow.insertCell().textContent = element["t_employees_last_name"];
            oRow.insertCell().textContent = element["t_employees_first_name"];
            oRow.insertCell().textContent = element["t_employees_patronymic"];
            oRow.insertCell().textContent = new Date(element["t_employees_birth_date"]).date.toString();
            oRow.insertCell().textContent = element["t_position_name"];
            oRow.insertCell().textContent = element["t_employees_residential_address"];

            document.querySelector(".page_data").append(oRow);
        });
    }
    // иначе отрисовать заглушку об отсутствующих данных, если ее еще нет
    else if (!document.querySelector('.no_data'))
        insert_new_element(create_element("h3", {"classList":["text-center","no_data"],
            "textContent": "Данные не найдены"}), "table_for_data", 0, "afterend");
}

// Добавление должностей для модального окна
document.getElementById('modal_position_search').addEventListener('change', function changeposition() {
    let val = document.querySelector("#position_list option[value='" + document.getElementById("modal_position_search").value + "']");
    if (val) {
        document.getElementById("selected_position").value = parseInt(val.dataset.value);
    }
    // перенос фокуса на input "Адрес проживания"
    document.getElementById("t_employees_residential_address").focus();
});

// Очистка поля "Должность"
document.getElementById('clear_position_button').addEventListener("click", () => {
    document.getElementById('selected_position').value = null;
});

// Выбор определенного сотрудника
document.getElementById('page_data').addEventListener("click", event => {
    if (my_string)
        delete my_string.dataset.selected;

    (my_string = event.target.closest('tr')).dataset.selected = true;

    // включить кнопки

    document.getElementById("delete_employee_button").dataset.t_employees_id = my_string.dataset.t_employees_id;
    document.getElementById("change_employee_button").dataset.t_employees_id = my_string.dataset.t_employees_id;
    if (my_string.dataset.t_employees_last_name.includes("УДАЛЕН")) {
        if (!document.getElementById("delete_employee_button").classList.contains("disabled"))
            document.getElementById("delete_employee_button").classList.add("disabled");
        if (!document.getElementById("change_employee_button").classList.contains("disabled"))
            document.getElementById("change_employee_button").classList.add("disabled");
    } else {
        if (document.getElementById("delete_employee_button").classList.contains("disabled"))
            document.getElementById("delete_employee_button").classList.remove("disabled");
        if (document.getElementById("change_employee_button").classList.contains("disabled"))
            document.getElementById("change_employee_button").classList.remove("disabled");
    }
});

// Вызов формы "Запись" для добавления данных
document.getElementById("add_employee_button").addEventListener("click", () => {
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
document.getElementById("change_employee_button").addEventListener("click", () => {
    // Обнулить валидацию
    document.querySelectorAll(".was-validated").forEach(el => {
        el.classList.remove('was-validated')
    })
    employee_data.forEach((oItem) => {
        if (oItem["t_employees_id"] === parseInt(my_string.dataset.t_employees_id)) {
            my_string.dataset.t_employees_id = oItem["t_employees_id"];
            my_string.dataset.t_employees_last_name = oItem["t_employees_last_name"];
            my_string.dataset.t_employees_first_name = oItem["t_employees_first_name"];
            my_string.dataset.t_employees_patronymic = oItem["t_employees_patronymic"];
            my_string.dataset.t_employees_birth_date = oItem["t_employees_birth_date"];
            my_string.dataset.t_employees_position = oItem["t_employees_position"];
            my_string.dataset.t_position_name = oItem["t_position_name"];
            my_string.dataset.t_employees_residential_address = oItem["t_employees_residential_address"];
        }
    });

    document.getElementById("add_data").querySelectorAll('[name]').forEach(item => {
        // поле либо пустое, либо содержит значение
        item.value = my_string.dataset[item.name] === "null" ? "" : my_string.dataset[item.name];
    })
});

// Определить тип вызова модального окна
document.getElementById('modal_window').addEventListener('shown.bs.modal', event => {
    // Обнулить валидацию
    document.querySelectorAll(".was-validated").forEach(el => {
        el.classList.remove('was-validated')
    })
    // очистить поля в модальном окне 2
    document.getElementById("add_data_2").querySelectorAll('[name]').forEach(item => {
        item.value = "";
    });
    generate_position_datalist(position_data);
    try {
        button_id = event.relatedTarget.id;
    }
    catch (e) {
        button_id = "add_employee_button";
    }
});

// Поиск в отфильтрованном массиве
function searchFor() {
    let toSearch = document.getElementById("search_filter").value.toLowerCase();
    let results = employee_data.filter(object => Object.values(object).some(i => i?i.toString().toLowerCase().includes(toSearch):false));
    print_rows(results)
}

let csrftoken = getCookie('csrftoken');

let form = document.getElementById('form_wrapper');
let form2 = document.getElementById('form_wrapper_2');

form.addEventListener('submit', event => {
    document.getElementById('search_filter').value = "";
    if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
    } else {
        event.preventDefault();
        let myModalEl = document.getElementById('modal_window');
        let modal = bootstrap.Modal.getInstance(myModalEl);

        // Если вызвавшая модальное окно кнопка - Добавить - добавить новую запись
        if (button_id === "add_employee_button") {

            let map_employees = new Map();
            // собрать значения полей в мап
            document.getElementById("add_data").querySelectorAll('[name]').forEach(item => {
                map_employees.set(item.name, item.value);
            });

            let sent_data = {
                "t_employees_last_name": map_employees.get("t_employees_last_name"),
                "t_employees_first_name": map_employees.get("t_employees_first_name"),
                "t_employees_patronymic": map_employees.get("t_employees_patronymic"),
                "t_employees_birth_date": map_employees.get("t_employees_birth_date"),
                "t_employees_position": map_employees.get("t_employees_position"),
                "t_employees_residential_address": map_employees.get("t_employees_residential_address"),
            };
            fetch('http://127.0.0.1:8000/api/employees_api/create/', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                body: JSON.stringify(sent_data)
            })
                .then(response => response.json()
                    .then(data => {
                        switch (data["error"]) {
                            case "All fields are required":
                                alert("Не все поля были заполнены!")
                                break;
                            case "Employee must be at least 15 years old":
                                alert("Сотрудник должен быть старше 15 лет!")
                                break;
                            default:
                                alert("ФИО должны содержать только русские буквы!")
                                break;
                        }
                    })
                )
                .catch(function () {
                    button_id = null
                    get_data_to_page().catch(function (err) {console.log(err)});
                    modal.hide();
                    document.querySelectorAll(".want-valid").forEach(el => {
                        el.classList.add('was-validated')
                    })
                })
        }
        if (button_id === "change_employee_button") {

            let map_employees = new Map();
            // собрать значения полей в мап
            document.getElementById("add_data").querySelectorAll('[name]').forEach(item => {
                map_employees.set(item.name, item.value);
            });

            let sent_data = {
                "t_employees_id": my_string.dataset.t_employees_id,
                "t_employees_last_name": map_employees.get("t_employees_last_name"),
                "t_employees_first_name": map_employees.get("t_employees_first_name"),
                "t_employees_patronymic": map_employees.get("t_employees_patronymic"),
                "t_employees_birth_date": map_employees.get("t_employees_birth_date"),
                "t_employees_position": map_employees.get("t_employees_position"),
                "t_employees_residential_address": map_employees.get("t_employees_residential_address"),
            };
            fetch('http://127.0.0.1:8000/api/employees_api/update/', {
                method: 'PUT',
                headers: {
                    'Content-type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                body: JSON.stringify(sent_data)
            })
                .then(response => response.json()
                    .then(data => {
                        switch (data["error"]) {
                            case "All fields are required":
                                alert("Не все поля были заполнены!")
                                break;
                            case "Employee must be at least 15 years old":
                                alert("Сотрудник должен быть старше 15 лет!")
                                break;
                            default:
                                alert("ФИО должны содержать только русские буквы!")
                                break;
                        }
                    })
                )
                .catch(function () {
                    button_id = null
                    get_data_to_page().catch(function (err) {console.log(err)});
                    modal.hide();
                    document.querySelectorAll(".want-valid").forEach(el => {
                        el.classList.add('was-validated')
                    })
                })
        }
    }
})
form2.addEventListener('submit', event => {
    document.getElementById('search_filter').value = "";
    if (!form2.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
    } else {
        event.preventDefault();
        let map_positions = new Map();
        // собрать значения полей в мап
        document.getElementById("add_data_2").querySelectorAll('[name]').forEach(item => {
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
                get_data_to_page().catch(function (err) {
                    console.log(err)
                });
            })

        let myModalEl = document.getElementById('modal_window_2');
        let modal = bootstrap.Modal.getInstance(myModalEl);
        modal.hide();
        bootstrap.Modal.getInstance(document.getElementById('modal_window')).show()
    }
    document.querySelectorAll(".want-valid").forEach(el => {
        el.classList.add('was-validated')
    })
})

// Удалить данные
document.getElementById("yes_delete_button").addEventListener("click", () => {
    document.getElementById('search_filter').value = "";
    let sent_data = {
        "t_employees_id":parseInt(my_string.dataset.t_employees_id),
    };
    fetch('http://127.0.0.1:8000/api/employees_api/delete/', {
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

function testfunc() {
    bootstrap.Modal.getInstance(document.getElementById('modal_window')).show()
}
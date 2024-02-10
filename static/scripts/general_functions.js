// Функция получения нужного cookie
function getCookie(name) {
    return new RegExp('(?:^|;\\s*)' + name
        .replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '=([^;]*)')
        .exec(document.cookie)?.[1];
}

// Разделить массив данных на массив массивов
function paginate(arr, size) {
  const pages = [];
    size = parseInt(size);

  for (let i = 0; i < arr.length; i += size) {
    const page = arr.slice(i, i + size);
    pages.push(page);
  }

  return pages;
}

// Функция создания кнопок пагинации
function create_pagination_button(class_list0, class_list1, id1, id2, href, onclick, text, pagination_number) {
    let new_link = document.createElement('li');
    new_link.classList.add(class_list0);
    new_link.classList.add(class_list1);
    if ((id1 + id2) !== '')
        new_link.setAttribute('id', id1 + id2);
    new_link.setAttribute('onclick', onclick);

    let new_a = document.createElement('a');
    new_a.classList.add('page-link');
    new_a.setAttribute('href', href);
    new_a.innerText = text;

    new_link.append(new_a);

    document.querySelectorAll(".pagination")[pagination_number].append(new_link);
}

// Добавление номеров страниц
function add_pagination(number_of_pg, pagination_number, active_page_number) {
    if (pages[pagination_number].length !== 0) {
        // меньше 8 - нет смысла тк на значении 8 отобразятся только сама страницы и 2 ее соседа (в пагинации)
        if (number_of_pg < 8) number_of_pg = 8;

        // не может быть нечетным - одинаковое число соседей слева и справа в пагинации
        if ((number_of_pg % 2) === 1) number_of_pg++;

        // коэффициенты для расчетаО
        let coefficients = [12, 6, 9, 9, 9, 7, 10, 10, 9, 4, 4, 3, 4, 4, 4];

        // Число (иконок страниц + иконок многоточий+1) в пагинации (не менее 8, четное)
        let nop = number_of_pg;

        //разница
        number_of_pg = 12 - number_of_pg;

        //расчет коэффициентов
        for (let i = 0; i < 17; i++) {
            if ((i === 1) || (i === 5) || (i === 11) || (i === 12))
                coefficients[i] = coefficients[i] - number_of_pg / 2;
            else if ((i === 9) || (i === 10) || (i === 13) || (i === 14)) {
                if (nop >= 10)
                    coefficients[i] = nop / 2 - 2;
                else coefficients[i] = (Math.abs(nop - 9)) + 1;
            } else coefficients[i] = coefficients[i] - number_of_pg;
        }

        // обнулить пагинацию, добавить кнопку Предыдущая
        document.querySelectorAll(".pagination")[pagination_number].innerHTML = '';
        // insert_new_element(create_element("li", {"classList": ["bi", "bi-arrow-down"]}), ".desc", 1, "beforeend");
        create_pagination_button('page-item', 'prev_page' + pagination_number, '', '', '#',
            'prev_page' + '(' + pagination_number + ')', '« ' + 'Предыдущая', pagination_number);

        // если число страниц меньше числа (иконок страниц + иконок многоточий+1) в пагинации
        if (pages[pagination_number].length < (coefficients[0])) {
            pages[pagination_number].forEach((el, i) => {
                create_pagination_button('page-item', 'page-list-' + pagination_number, 'page_' + pagination_number + '_', i, 'javascript:void(0)',
                    'change_page' + '(' + pagination_number + ',' + i + ')', (i + 1), pagination_number);
            });
        }
        // иначе
        else {
            // если индекс текущей страницы меньше (6 - разница/2),
            // отрисовать от первой до (9 - разница) страниц (текущая стр в начале: (1 из 30)/(2 из 30)/(3 из 30)/(4 из 30)/.../(30 из 30))
            if (current_page[pagination_number] < (coefficients[1])) {
                for (let i = 0; i < (coefficients[2]); i++) {
                    create_pagination_button('page-item', 'page-list-' + pagination_number, 'page_' + pagination_number + '_', i, 'javascript:void(0)',
                        'change_page' + '(' + pagination_number + ',' + i + ')', (i + 1), pagination_number);
                }
                // добавить правую страницу-многоточие
                create_pagination_button('page-item', 'page-list-' + pagination_number, 'page_' + pagination_number + '_', coefficients[4], 'javascript:void(0)',
                    'change_page' + '(' + pagination_number + ',' + (coefficients[3]) + ')', '...', pagination_number);
                // добавить последнюю страницу
                create_pagination_button('page-item', 'page-list-' + pagination_number, 'page_' + pagination_number + '_',
                    (pages[pagination_number].length - 1), 'javascript:void(0)',
                    'change_page' + '(' + pagination_number + ',' + (pages[pagination_number].length - 1) + ')',
                    (pages[pagination_number].length), pagination_number);
            }
            // если индекс текущей страницы больше (число всех страниц - (7 - разница/2)),
            // отрисовать первую страницу, левое многоточие и от (число всех страниц - (9 - разница)) до последней страницы
            // (текущая стр в конце: (1 из 30)/.../(27 из 30)/(28 из 30)/(29 из 30)/(30 из 30))
            else if (current_page[pagination_number] > (pages[pagination_number].length - (coefficients[5]))) {
                // добавить первую страницу
                create_pagination_button('page-item', 'page-list-' + pagination_number, 'page_' + pagination_number + '_', 0, 'javascript:void(0)',
                    'change_page' + '(' + pagination_number + ',' + 0 + ')', (1), pagination_number);
                // добавить левую страницу-многоточие
                create_pagination_button('page-item', 'page-list-' + pagination_number, 'page_' + pagination_number + '_',
                    (pages[pagination_number].length - (coefficients[7])), 'javascript:void(0)',
                    'change_page' + '(' + pagination_number + ',' + (pages[pagination_number].length - (coefficients[6])) + ')', '...', pagination_number);
                // добавить остальные страницы
                for (let i = (pages[pagination_number].length - (coefficients[8])); i < pages[pagination_number].length; i++) {
                    create_pagination_button('page-item', 'page-list-' + pagination_number, 'page_' + pagination_number + '_', i, 'javascript:void(0)',
                        'change_page' + '(' + pagination_number + ',' + i + ')', (i + 1), pagination_number);
                }
            }
            // иначе
            else {
                // отрисовать первую страницу
                create_pagination_button('page-item', 'page-list-' + pagination_number, 'page_' + pagination_number + '_', 0, 'javascript:void(0)',
                    'change_page' + '(' + pagination_number + ',' + 0 + ')', (1), pagination_number);
                //отрисовать левое многоточие
                create_pagination_button('page-item', 'page-list-' + pagination_number, 'page_' + pagination_number + '_',
                    (current_page[pagination_number] - coefficients[10]), 'javascript:void(0)',
                    'change_page' + '(' + pagination_number + ',' + (current_page[pagination_number] - coefficients[9]) + ')', '...', pagination_number);
                // отрисовать соседние страницы слева и справа (3 - разница/2 и 4 - разница/2)
                for (let i = (current_page[pagination_number] - (coefficients[11])); i < (current_page[pagination_number] + (coefficients[12])); i++) {
                    create_pagination_button('page-item', 'page-list-' + pagination_number, 'page_' + pagination_number + '_', i, 'javascript:void(0)',
                        'change_page' + '(' + pagination_number + ',' + i + ')', (i + 1), pagination_number);
                }
                // отрисовать правое многоточие
                create_pagination_button('page-item', 'page-list-' + pagination_number, 'page_' + pagination_number + '_',
                    (current_page[pagination_number] + coefficients[14]), 'javascript:void(0)',
                    'change_page' + '(' + pagination_number + ',' + (current_page[pagination_number] + coefficients[13]) + ')', '...', pagination_number);
                // отрисовать последнюю страницу
                create_pagination_button('page-item', 'page-list-' + pagination_number, 'page_' + pagination_number + '_',
                    (pages[pagination_number].length - 1), 'javascript:void(0)',
                    'change_page' + '(' + pagination_number + ',' + (pages[pagination_number].length - 1) + ')', (pages[pagination_number].length), pagination_number);
            }
        }
        // Добавить кнопку Следующая
        create_pagination_button('page-item', 'next_page' + pagination_number, '', '', '#',
            'next_page' + '(' + pagination_number + ')', 'Следующая' + ' »', pagination_number);
        // удалить статус активной для всех иконок страниц
        document.querySelectorAll('.page-list-' + pagination_number).forEach(el => {
            if (el.classList.contains("active"))
                el.classList.remove("active");
        });

        // сделать иконку страницы с номером текущей страницы активной
        document.getElementById("page_" + pagination_number + "_" + active_page_number).classList.add("active");

        // выключены/нет кнопки Следующая и Предыдущая
        let prev_page_button = document.querySelector(".prev_page" + pagination_number).classList;
        let next_page_button = document.querySelector(".next_page" + pagination_number).classList;
        // выключить кнопки Предыдущая и Следующая в зависимости от текущей страницы
        if (parseInt(current_page[pagination_number]) === (parseInt(pages[pagination_number].length) - 1))
            next_page_button.add("disabled");
        else if (next_page_button.contains("disabled"))
            next_page_button.remove("disabled");
        if (current_page[pagination_number] === 0)
            prev_page_button.add("disabled");
        else if (prev_page_button.contains("disabled"))
            prev_page_button.remove("disabled");
    }
}

//Нажатие на кнопку "Следующая"
function next_page(i) {
    if ((pages[i].length - 1) > current_page[i]) {
        current_page[i]++;
        change_page(i, current_page[i]);
    }
}

//Нажатие на кнопку "Предыдущая"
function prev_page(i) {
    if ((current_page[i] < pages[i].length) && (current_page[i] !== 0)) {
        current_page[i]--;
        change_page(i, current_page[i]);
    }
}

// ФИЛЬТРЫ

// Цех выбран
function set_default_division_value() {
    if (selected_division !== "") {
        document.getElementById("division_data").value = selected_division;
        selected_division = ""
    } else {
        document.getElementById("division_data").value = window.localStorage.getItem('division');
    }
}

// Тип персонала выбран
function set_default_staff_type_value() {
    if (selected_staff_type !== "") {
        document.getElementById("staff_data").value = selected_staff_type;
        selected_staff_type = ""
    } else
        document.getElementById("staff_data").value = staff_data[0].staff_type_name;
}

// Изменение цеха
function change_division_value() {
    selected_division = document.getElementById("division_data").value;
    document.getElementById('search_filter').value = "";
    if (document.getElementById('toggleCheck'))
        document.getElementById('toggleCheck').checked = true;
    get_data_to_page(0).then(() => {document.querySelector(".navbar-brand").focus();}).catch(function (err) {console.log(err)});
}

// Изменение типа персонала
function change_staff_type_value() {
    selected_staff_type = document.getElementById("staff_data").value;
    document.getElementById('search_filter').value = "";
    document.getElementById('toggleCheck').checked = true;
    get_data_to_page(0).then(() => {document.querySelector(".navbar-brand").focus();}).catch(function (err) {console.log(err)});
}

// Потеря фокуса (цех)
function remember_division_value_and_clear_input() {
    selected_division = document.getElementById("division_data").value;
    document.getElementById("division_data").value = "";
}

// Потеря фокуса (тип персонала)
function remember_staff_type_value_and_clear_input() {
    selected_staff_type = document.getElementById("staff_data").value;
    document.getElementById("staff_data").value = "";
}

// Выбор даты
function change_date_value() {
    document.getElementById('search_filter').value = "";
    document.getElementById('toggleCheck').checked = true;
    get_data_to_page(0).then(() => {document.querySelector(".navbar-brand").focus();}).catch(function (err) {console.log(err)});
}

// Выбор количества показываемых строк
function change_page_size(pagination_number) {
    page_size[pagination_number] = document.getElementById("show_by_"+pagination_number).
        options[document.getElementById("show_by_"+pagination_number).selectedIndex].value;
    get_data_to_page(0).catch(function (err) {console.log(err)});
}

// Включить/нет пагинацию таблицы
function change_pagination_state() {
    get_data_to_page(0)
        .then(() => {
            if (!document.querySelector('.no_data'))
                document.getElementById('pagination').hidden = document.getElementById('toggleCheck').checked !== true;
        })
        .then(() => {
            if (document.getElementById("search_filter").value !== "")
                searchFor();
        })
        .catch(function (err) { console.log(err) });
}

// Включить/нет фиксацию таблицы
function change_fixation_state() {
    let date = document.getElementById("change_date").value;
    date = date.substring(0, 4) + '-' + date.substring(5, 7) + '-01';
    let val = document.querySelector("#division_list option[value='" + document.getElementById("division_data").value + "']");
    val = val ? parseInt(val.dataset.value) : 1;
    // отправляемый массив
    let sent_data = {
        "date": date,
        "division": val,
        "organic_number": user,
        "state": document.getElementById("premiumFix").checked,
    }
    fetch('http://127.0.0.1:8000/api/premium_fixation_api/create/', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify(sent_data)
    }).catch(function (err) { console.log(err) });
    get_data_to_page(0)
        .then(() => {
            if (!document.querySelector('.no_data'))
                document.getElementById('pagination').hidden = document.getElementById('toggleCheck').checked !== true;
        })
        .then(() => {
            if (document.getElementById("search_filter").value !== "")
                searchFor();
        })
        .catch(function (err) { console.log(err) });
}

// Генерация datalist (подразделения)
function generate_division_datalist(arr) {
    arr.forEach(element => {
        let val = element.division;
        val = standardize_division_number(val);
        if (val !== '000') {
            insert_new_element(create_element("option", {"data-value":element.division, "value":val+" - "+element.division_name}),
            ".select_division", 1, "beforeend");
        }
    });
}

// Добавление номера цеха
function standardize_division_number(val) {
    let char = '';
    if (val instanceof Array) {
        val.forEach(el => {
            const parsedVal = isNaN(parseInt(el)) ? "" : parseInt(el);
            const prefix = parsedVal === "" ? "" : (parsedVal < 10 ? '00' : (parsedVal < 100 ? '0' : ''));
            char = char === '' ? prefix + parsedVal : char + ',' + prefix + parsedVal;
        })
        return char;
    }
    else {
        const parsedVal = isNaN(parseInt(val)) ? "" : parseInt(val);
        const prefix = parsedVal === "" ? "" : (parsedVal < 10 ? '00' : (parsedVal < 100 ? '0' : ''));
        return prefix + parsedVal;
    }
}

// Генерация datalist (Тип персонала)
function generate_staff_type_datalist(arr) {
    arr.forEach(element => {
        insert_new_element(create_element("option", {"data-value":element.staff_type, "value":element.staff_type_name}),
            ".select_staff", 1, "beforeend");
        // document.querySelector(".select_staff").insertAdjacentHTML("beforeend",
        //     '<option' + ' data-value="' + element.staff_type + '" value="' + element.staff_type_name + '"></option>'
        // );
    });
}

// Изменение размера таблицы(без включенной пагинации) в зависимости от размера видимого пользователю окна
function table_resize () {
    // выключение прокрутки таблицы
    document.querySelector('.table-responsive').style.overflowY = "inherit";
    // определение и задание максимального размера таблицы
    document.querySelector('.table-responsive').style.maxHeight=(window.innerHeight-10-
        document.querySelector(".table").getBoundingClientRect().top+"px");
    // включение прокрутки таблицы
    document.querySelector('.table-responsive').style.overflowY = "auto";
}

// Установить значения в localStorage по умолчанию, если их там нет
function set_default_localStorage_values() {
    // Подразделение
    if ((window.localStorage.getItem('division') === "") || (!window.localStorage.getItem('division'))) {
        let val = parseInt(division_data[0].division) === 0 ? division_data[1].division : division_data[0].division;
        val = standardize_division_number(val);
        parseInt(division_data[0].division) === 0 ? window.localStorage.setItem('division', val + ' - ' + division_data[1].division_name)
            : window.localStorage.setItem('division', val + ' - ' + division_data[0].division_name);
    }
    // Тип персонала
    if ((window.localStorage.getItem('staff_type') === "") || (!window.localStorage.getItem('staff_type'))) {
        window.localStorage.setItem('staff_type', staff_data[0].staff_type_name);
    }
    // Дата
    if (window.localStorage.getItem('date')) {
        document.getElementById("change_date").value = window.localStorage.getItem('date').substring(0, 4) +
            '-' + window.localStorage.getItem('date').substring(5, 7)
    } else if (document.getElementById("change_date") ) {
        document.getElementById("change_date").value = new Date().getFullYear() + "-" +
            (String(new Date().getMonth() + 1).padStart(2, '0'));
        window.localStorage.setItem('date', new Date().getFullYear() + "-" +
            (String(new Date().getMonth() + 1).padStart(2, '0')));
    }
}

// Очистить таблицу, спрятать таблицу и пагинацию (если надо) к ней
function clear_table_and_hide_pagination(turn_off_pagination, table_body_name, table_name, pagination_name) {
    document.querySelector(table_body_name).innerHTML = "";
    document.getElementById(table_name).hidden = true;
    if (turn_off_pagination === 1)
        document.getElementById(pagination_name).hidden = true;
}

// Выравнивание столбца
function col_align(header_rows_count, row_count, align_col, align_type) {
    row_count = isNaN(parseInt(row_count)) ?
        (typeof document.getElementById("toggleCheck" === "undefined") ? (parseInt(filtered_user_data1.length))
            : (document.getElementById("toggleCheck").checked ? parseInt(document.getElementById("show_by_0").value)
                : parseInt(filtered_user_data1.length)))
        : parseInt(row_count)
    for (let i = header_rows_count; i < (header_rows_count + row_count); i++) {
        if (document.querySelectorAll('tr:not(.modal_tr)')[i]) {
            if (document.querySelectorAll('tr:not(.modal_tr)')[i].querySelectorAll('td')[align_col]) {
                document.querySelectorAll('tr:not(.modal_tr)')[i].querySelectorAll('td')[align_col].classList.add(align_type);
            }
        }
    }
}

// Индекс элемента
const getNodeIndex = elm => [...elm.parentNode.children].findIndex(i => i === elm);

// Сортировка по параметру
const sort_by = (field, reverse, primer) => {
    const key = primer ? function (x) { return primer(x[field]); } : function (x) { return x[field]; };
    reverse = !reverse ? 1 : -1;
    return function(a, b) {
        try { a = key(a); } catch (e) { a = 0; }
        try { b = key(b); } catch (e) { b = 0; }
        return reverse * ((a > b) - (b > a));
    }
}

// Сортировка массива
function sort_array(arr, id, reverse) {
    if ((id === "t_position_name"))
        // || (id === "expansion_name") || (id === "responsible") || (id === "division_name") || (id === "staff_type_name"))
        arr.sort(sort_by(id, reverse, (a) => a.toLowerCase()));
    // else if (typeof arr[0].expansion_id !== "undefined" && (id === "division" || id === "staff_type"))
    //     arr.sort(sort_by(id, reverse, (a) => a.length));
    // else if ((id === "organic_number") || (id === "division") || (id === "staff_type"))
    //     arr.sort(sort_by(id, reverse, parseInt));
    // else if ((id === "completion_date") || (id === "date"))
    //     arr.sort(sort_by(id, reverse, (a) => new Date(a)));
    // else if (id === "factual_premium")
    //     arr.sort(sort_by(id, reverse, parseFloat));
    // else
    //     arr.sort(sort_by(id, reverse, parseFloat));
}

// Добавить сортировку
function add_sorting() {
    document.querySelectorAll(".sorted").forEach(el => {
        if (!el.hasAttribute("listener")) {
            el.setAttribute("listener", "true");
            el.addEventListener('click', function () {
                document.querySelectorAll(".sorted").forEach(e => {
                    if (e !== el) {
                        if (e.classList.contains("asc"))
                            e.classList.remove("asc");
                        if (e.classList.contains("desc"))
                            e.classList.remove("desc");
                    }
                });
                if (el.classList.contains("asc")) {
                    el.classList.remove("asc");
                    el.classList.add("desc");
                } else if (el.classList.contains("desc")) {
                    el.classList.remove("desc");
                    el.classList.add("asc");
                } else el.classList.add("asc");
                let results = filtered_user_data1;
                if (document.getElementById("search_filter")) {
                    filtered_user_data1 = results.filter(object => Object.values(object).some(
                        i => i ? i.toString().toLowerCase().includes(document.getElementById("search_filter").value.toLowerCase()) : false));
                }
                sort_array(filtered_user_data1, el.id, el.classList.contains("desc"));
                if (document.querySelector(".bi"))
                    document.querySelector(".bi").remove();
                if (document.querySelector(".asc"))
                    insert_new_element(create_element("span", {"classList": ["bi", "bi-arrow-up"]}), ".asc", 1, "beforeend");
                if (document.querySelector(".desc"))
                    insert_new_element(create_element("span", {"classList": ["bi", "bi-arrow-down"]}), ".desc", 1, "beforeend");
                try {
                    rebuild_table(filtered_user_data1, 0, page_size);
                }
                catch (e) {
                    rebuild_table(filtered_user_data1, undefined, filtered_user_data1.length);
                }
            })
        }
    });
}

// Перерисовка таблицы для поиска и сортировки
function rebuild_table(arr, pagination_number, page_size, footer, special_param_for_home_page) {

    if (pagination_number !== undefined) {
        // разбивка на страницы
        pages[pagination_number] = paginate(arr, page_size);

        // удаление старых номеров страниц
        document.querySelectorAll(".page-list").forEach(el => {
            el.remove();
        });
        change_page(pagination_number, (document.querySelector(".page-item.active") ?
            parseInt(document.querySelector(".page-item.active").attributes.getNamedItem('id').value.toString().substring(7)) : 0));
    }
    else {
        print_rows(arr);
    }

    if (footer !== undefined) {
        if (special_param_for_home_page !== undefined)
            getFooter(arr, special_param_for_home_page);
        else
            getFooter(arr);
    }
    if (arr.length > 0) {
        if (document.getElementById('toggleCheck')) {
            document.getElementById('pagination').hidden =
                !document.getElementById("toggleCheck").checked;
        }
    }
}

// Создание элемента
function create_element(element, el_attr, el_addition) {
    let new_el = document.createElement(element);
    if (el_attr) {
        Object.entries(el_attr).forEach(([key, value]) => {
            if (key === "classList") {
                if (Array.isArray(value)) {
                    for (let i = 0; i < value.length; i++) {
                        new_el.classList.add(value[i]);
                    }
                }
                else new_el.classList.add(value);
            } else if (key === "textContent") {
                new_el.textContent = value;
            } else {
                new_el.setAttribute(key, value);
            }
        });
    }
    if (el_addition) {
        el_addition.forEach(el => {
            new_el.insertAdjacentHTML("beforeend",el);
        });
    }
    return new_el;
}

// Вставка элемента
function insert_new_element(el, position, type_of_insert, position_of_insert, id) {
    switch (type_of_insert) {
        case 0:
            document.getElementById(position).insertAdjacentElement(position_of_insert, el);
            break;
        case 1:
            document.querySelector(position).insertAdjacentElement(position_of_insert, el);
            break;
        case 2:
            id = id === undefined ? 0 : id;
            document.querySelectorAll(position)[id].insertAdjacentElement(position_of_insert, el);
            break;
        default:
            console.error('Invalid type_of_insert');
    }
}

// Изменение пагинации в зависимости от размера видимого пользователю окна
function pagination_resize() {
    if (number_of_pages !== undefined) {
        number_of_pages = (window.innerWidth < 1360 && pages[0].length > 10) ? 8 : 12;
        if (document.querySelector('.pagination') !== undefined) {
            for (let i = 0; i < document.querySelectorAll('.pagination').length; i++) {
                add_pagination(number_of_pages, i, document.querySelector(".page-item.active") === null ? 0 :
                    parseInt(document.querySelector(".page-item.active").id.slice(7)));
            }
        }
    }
    if (document.querySelector('.pagination') !== undefined) {
        document.querySelectorAll('.pagination').forEach(el => {
            el.classList.toggle("pagination-sm", window.innerWidth < 1360);
            el.classList.toggle("justify-content-start", window.innerWidth < 1360);
            el.classList.toggle("justify-content-center", window.innerWidth >= 1360);
        });
    }
}
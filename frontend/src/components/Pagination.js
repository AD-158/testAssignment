import React from 'react';
import {Pagination} from 'react-bootstrap';

export default function MyPagination({number_of_pg, total_pages_number, handlePageChange, currentPage}) {
    try {
        parseInt(number_of_pg)
        if (number_of_pg < 8) number_of_pg = 8;
        if ((number_of_pg % 2) === 1) number_of_pg++;

        let coefficients = [12, 6, 9, 9, 9, 7, 10, 10, 9, 4, 4, 3, 4, 4, 4];

        let nop = number_of_pg;
        number_of_pg = 12 - number_of_pg;

        for (let i = 0; i < 17; i++) {
            if ((i === 1) || (i === 5) || (i === 11) || (i === 12))
                coefficients[i] = coefficients[i] - number_of_pg / 2;
            else if ((i === 9) || (i === 10) || (i === 13) || (i === 14)) {
                if (nop >= 10)
                    coefficients[i] = nop / 2 - 2;
                else coefficients[i] = (Math.abs(nop - 9)) + 1;
            } else coefficients[i] = coefficients[i] - number_of_pg;
        }

        const paginationItems = [];

        paginationItems.push(
            <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)}
                             disabled={currentPage === 0} key={0}>
                « Предыдущая
            </Pagination.Prev>
        );

        if (total_pages_number < coefficients[0]) {
            for (let i = 0; i < total_pages_number; i++) {
                paginationItems.push(
                    <Pagination.Item active={i === currentPage} onClick={() => handlePageChange(i)} key={i + 1}>
                        {i + 1}
                    </Pagination.Item>
                );
            }
        } else {
            if (currentPage < coefficients[1]) {
                for (let i = 0; i < coefficients[2]; i++) {
                    paginationItems.push(
                        <Pagination.Item active={i === currentPage} onClick={() => handlePageChange(i)} key={i + 1}>
                            {i + 1}
                        </Pagination.Item>
                    );
                }
                paginationItems.push(
                    <Pagination.Ellipsis onClick={() => handlePageChange(coefficients[3])}/>
                );
                paginationItems.push(
                    <Pagination.Item active={(total_pages_number - 1) === currentPage}
                                     onClick={() => handlePageChange((total_pages_number - 1))} key={total_pages_number}>
                        {total_pages_number}
                    </Pagination.Item>
                );
            } else if (currentPage > (total_pages_number - (coefficients[5]))) {
                paginationItems.push(
                    <Pagination.Item active={0 === currentPage} onClick={() => handlePageChange(0)} key={1}>
                        1
                    </Pagination.Item>
                );
                paginationItems.push(
                    <Pagination.Ellipsis onClick={() => handlePageChange(total_pages_number - (coefficients[6]))}/>
                );
                for (let i = (total_pages_number - (coefficients[8])); i < total_pages_number; i++) {
                    paginationItems.push(
                        <Pagination.Item active={i === currentPage} onClick={() => handlePageChange(i)} key={i + 1}>
                            {i + 1}
                        </Pagination.Item>
                    );
                }
            }
            else {
                paginationItems.push(
                    <Pagination.Item active={total_pages_number === currentPage} onClick={() => handlePageChange(0)} key={1}>
                        1
                    </Pagination.Item>
                );
                paginationItems.push(
                    <Pagination.Ellipsis onClick={() => handlePageChange(currentPage - (coefficients[10]))}/>
                );
                for (let i = (currentPage - (coefficients[11])); i < (currentPage + (coefficients[12])); i++) {
                    paginationItems.push(
                        <Pagination.Item active={i === currentPage} onClick={() => handlePageChange(i)} key={i + 1}>
                            {i + 1}
                        </Pagination.Item>
                    );
                }
                paginationItems.push(
                    <Pagination.Ellipsis onClick={() => handlePageChange(currentPage + (coefficients[13]))}/>
                );
                paginationItems.push(
                    <Pagination.Item active={(total_pages_number - 1) === currentPage}
                                     onClick={() => handlePageChange((total_pages_number - 1))} key={total_pages_number}>
                        {total_pages_number}
                    </Pagination.Item>
                );
            }
        }

        paginationItems.push(
            <Pagination.Next onClick={() => handlePageChange(currentPage + 1)}
                             disabled={(total_pages_number - 1) === currentPage} key={total_pages_number + 1}>
                Следующая »
            </Pagination.Next>
        );

        return (
            <Pagination className="m-0 ps-5 ms-5">
                {paginationItems}
            </Pagination>
        );
    } catch (e) {
        return null;
    }
}
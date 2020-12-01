# Spreadsheet
This repository consists of spreadsheet application like google sheets using Javascript, RxJS, and SCSS.

# Functionalities
1. The user can add rows to the spreadsheet using a plus button.
2. The user can add columns to the spreadsheet using a plus button.
3. The user can delete rows on the spreadsheet using a minus button.
4. The user can delete columns on the spreadsheet using a minus button.
5. The user can select multiple rows or columns and display their sum in a cell by using a formula. 6. The formula should be of the format "=SUM(START_CELL:END_CELL)". Example "=SUM(A1:A10)" to display the sum of all items from cell A1 to A10. Any changes to the cell content in the selected range should update the sum.
7. The user can perform simple algebraic operations (+, -, *, /) with cell references that follow BODMAS rule. Example "=A1+A2-A4".
8. The user can export the sheet as a CSV file.
9. The user can load a CSV from the node server by clicking a load button.

# Technical Requirements:

1. This assignment uses JavaScript events & RxJS.
2. Events for the formula are implemented using RxJS and buttons use simple event listeners.
3. On clearing formula, all subscribers and events are cleared from the page.
4. No javascript frameworks are used except RxJS.
5. No CSS frameworks are used.
6. ES6 syntax is used.

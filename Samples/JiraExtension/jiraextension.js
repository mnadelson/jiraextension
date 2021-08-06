'use strict';

// Wrap everything in an anonymous function to avoid polluting the global namespace
(function() {
    // Use the jQuery document ready signal to know when everything has been initialized
    $(document).ready(function() {
        // Tell Tableau we'd like to initialize our extension
        tableau.extensions.initializeAsync().then(function() {
            // Once the extension is initialized, ask the user to choose a sheet
            const dashboardName = tableau.extensions.dashboardContent.dashboard.name;
            $('#choose_sheet_title').text(dashboardName);

            const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
            worksheets.forEach(function(worksheet) {
                const worksheetName = worksheet.name.replace(/\s+/g,"_")
                $("#worksheets").append("<div class='row'>" +
                                        "   <div class='col-auto'>" +
                                        "       <h4>" + worksheet.name + "</h4>" +
                                        "   </div>" +
                                        "</div>" +
                                        "<div class='row'>" +
                                        "   <div class='col-auto'>" +
                                        "       <label>Title:</label>" +
                                        "   </div>" +
                                        "   <div class='col-auto'>" +
                                        "       <input type='text' size='50' id='title_" + worksheetName + "'/>" +
                                        "   </div>" +
                                        "</div>" +
                                        "<div class='row'>" +
                                        "   <div class='col-auto'>" +
                                        "       <label>Description:</label>" +
                                        "   </div>" +
                                        "   <div class='col-auto'>" +
                                        "       <textarea rows='5' cols='50' id='descr_" + worksheetName + "'></textarea>" +
                                        "   </div>" +
                                        "</div>" +
                                        "<div class='row'>" +
                                        "   <div class='col-auto'>" +
                                        "       <button type='button' id='submit_" + worksheetName + "'>Submit Issue</button>" +
                                        "   </div>" +
                                        "</div>"
                                        );
                $("#submit_" + worksheetName).click(function() {
                    const name = worksheet.name;
                    const sheetType = worksheet.sheetType;
                    let datasourceNames = "";
                    worksheet.getDataSourcesAsync().then(function(datasources) {
                        datasources.forEach(function(datasource)
                         { datasourceNames += datasource.name + "," }
                        );
                        const title = $('#title_' + worksheetName).val() + "_" + name;
                        const description = "SheetType: " + sheetType + ", Datasources: " + datasourceNames + " " + $('#descr_' + worksheetName).val();
                        const jiraIssue = "{ " +
                                              "\"fields\": { " +
                                              "\"project\": { " +
                                              "\"key\": \"TAB\" " +
                                              "}, " +
                                              "\"summary\": \"" + title + "\", " +
                                              "\"description\": \"" + description + "\"," +
                                              "\"issuetype\": { \"name\": \"Task\" } " +
                                              "} " +
                                              "}";
                        const url = $('#jiraUrl').val() + "/rest/api/2/issue/";
                        const username = $('#jiraUsername').val();
                        const password = $('#jiraPassword').val();
                        $.ajax({
                          type: "POST",
                          url: url,
                          contentType: "application/json; charset=utf-8",
                          data: jiraIssue,
                          dataType: "json",
                          beforeSend: function (xhr) {
                              xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
                          },
                          success: function (result){
                              alert("Jira Ticket Was Successfully Created: " + result.id)
                          },
                          error: function (jqXHR, textStatus, errorThrown) {
                            alert("Error: " + errorThrown);
                          }
                        });
                    });
                });
            });
        });

    });
})();
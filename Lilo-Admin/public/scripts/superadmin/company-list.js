$(document).ready(function () {
    $(document).on("click", ".btn-edit", function () {
        const companyCode = $(this).data("id"); // Get the company code
        $.get(`/superadmin/view-company/${companyCode}`, function (data) {
            const company = data.company;
            // Populate the form with company details
            $("#editCompCode").val(company.compCode);
            $("#editCompUser").val(company.compUser);
            $("#editCompName").val(company.compName);
            $("#editCompEmail").val(company.compEmail);
            $("#editCompAddress").val(company.compAddress);
            $("#editCompNum").val(company.compNum);
            $("#editSubType").val(company.subType);
            $("#editCompExp").val(company.compExp);

            const compVer = company.compVer || [];
            $("input[name='compVer']").prop("checked", false);
            compVer.forEach((version) => {
                $(`input[name='compVer'][value='${version}']`).prop(
                    "checked",
                    true
                );
            });

            const compFeat = company.compFeat || [];
            $("input[name='compFeat']").prop("checked", false);
            compFeat.forEach((feature) => {
                $(`input[name='compFeat'][value='${feature}']`).prop(
                    "checked",
                    true
                );
            });

            $("#editCompanyModal").show();
        }).fail(function () {
            alert("Failed to fetch company details.");
        });
    });

    $(".edit-close-btn").click(function () {
        $("#editCompanyModal").hide();
    });

    $("#editCompanyForm").submit(function (e) {
        e.preventDefault();

        const companyCode = $("#editCompCode").val();

        // Get the checked values for compVer and compFeat
        let compVer = Array.from($("input[name='compVer']:checked")).map(
            (el) => el.value
        );
        let compFeat = Array.from($("input[name='compFeat']:checked")).map(
            (el) => el.value
        );

        // If 'All' is selected for compVer or compFeat, set only 'All' to the respective array
        if (compVer.includes("All")) {
            compVer = ["All"];
        }
        if (compFeat.includes("All")) {
            compFeat = ["All"];
        }

        // Build form data manually
        const formData = {
            compCode: companyCode,
            compUser: $("#editCompUser").val(),
            compName: $("#editCompName").val(),
            compEmail: $("#editCompEmail").val(),
            compAddress: $("#editCompAddress").val(),
            compNum: $("#editCompNum").val(),
            subType: $("#editSubType").val(),
            compExp: $("#editCompExp").val(),
            compVer: compVer,
            compFeat: compFeat,
        };

        $.ajax({
            url: `/superadmin/update-company/${companyCode}`,
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(formData),
            success: function (response) {
                alert(response.message);
                $("#editCompanyModal").hide();
                window.location.href = "/superadmin/home";
            },
            error: function (err) {
                const errors = err.responseJSON.errors || [];
                $("#editErrorMessages").html(
                    errors
                        .map((error) => `<p class="error-message">${error}</p>`)
                        .join("")
                );
            },
        });
    });

    $(document).on("click", ".btn-delete", function () {
        const companyCode = $(this).data("id");

        $.get(`/superadmin/view-company/${companyCode}`, function (data) {
            const company = data.company;
            $("#delName").text(company.compName);
            $("#delcompCode").text(company.compCode);
        });
    });

    $("#delConfirm").click(function () {
        const companyCode = $("#delcompCode").text();
        $.ajax({
            url: `/superadmin/delete-company/${companyCode}`,
            method: "DELETE",
            success: function (response) {
                alert(response.message);
                $(`#row-${companyCode}`).remove();
                $("#deleteCompModal").hide();
                $(".modal-backdrop").remove(); // Remove the modal backdrop
            },
            error: function (err) {
                alert("Error deleting the company.");
            },
        });
    });

    $(".modal-overlay").click(function (event) {
        if (event.target === this) {
            $(this).hide();
        }
    });

    $("#export-complist").on("click", function () {
        console.log("Export button clicked");

        if (table.data().count() === 0) {
            alert("No records available for export.");
            return;
        }

        const rows = [];
        rows.push([
            "Company Code",
            "Company User",
            "Company Name",
            "Email",
            "Contact Number",
            "Subscriber Type",
            "Expiration Day",
            "Features",
            "Versions",
        ]);

        window.table.rows({ search: "applied" }).every(function () {
            const data = this.data();
            rows.push([
                data[0],
                data[1],
                data[2],
                data[3],
                data[4],
                data[5],
                data[6],
                `"${data[7]}"`,
                `"${data[8]}"`,
            ]);
        });

        const csvContent = rows.map((e) => e.join(",")).join("\n");

        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", "companies_logs.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});

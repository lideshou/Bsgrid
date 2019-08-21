window.onload=function () {
    //页面响应式
    var thisScreeWidth = $(window).width();
    if(thisScreeWidth < 1200){
        thisScreeWidth = 1200;
    }
    var thisFontSize = 12 * (thisScreeWidth / 1366) +'px';
    $("html").css('font-size',thisFontSize);
    $(window).resize(function(){
        var thisWidth = $(window).width();
        if(thisWidth < 1200){
            thisWidth = 1200;
        }
        var thisSize = 12 * (thisWidth / 1366) +'px';
        $("html").css('font-size',thisSize);
    });

    billTable.init();
    carParkRecordDetails.init();
    tools.setDefaultDate();
};

var billTable={
    //表格对象初始化
    init:function () {
        billTable.gridObj =$.fn.bsgrid.init('searchTable',{
            url: urlConfig.carParkRecharge.reChargeMsg,
            ajaxType:'post',
            pageSize: 10,
            pageIncorrectTurnAlert: false,
            pagingLittleToolbar: true,
            otherParames: carParkRecordDetails.searchCriteria,
            complete:function (option,res) {
                $('.cashPostal_invest_details_report .loading').hide();
                //判断数据是否为空
                if(res.data){
                    $('#cashPostal_invest_details_report_table').css('display', 'table');
                    $('.empty').css('display', 'none');
                    $('#cashPostal_invest_details_report_table_pt_outTab').css('display', 'table')
                }else{
                    $('#cashPostal_invest_details_report_table').css('display', 'none');
                    $('.empty').css('display', 'block');
                    $('#cashPostal_invest_details_report_table_pt_outTab').css('display', 'none')
                }
                // let searchForTotal = {...cashPostalInvestDetails.searchCriteria};
                // cashPostalInvestDetails.getTheWayRechargeListTotalData(JSON.stringify(searchForTotal));

                // delete searchForTotal.pay_order_no
                // 金额总计
                /*billTable.getRecordTotal(JSON.stringify(carParkRecordDetails.searchCriteria))*/
                carParkRecordDetails.getRecordTotal(JSON.stringify(carParkRecordDetails.searchCriteria))
            },
            additionalAfterRenderGrid: function () {
                $("#totalPage").html(billTable.gridObj.getTotalPages());
                $("#totalData").html(billTable.gridObj.getTotalRows());
            }
        });

        //分页按钮功能
        $('#goBtn').click(function () {
            console.log("click");
            let page = $('#goPage input').val();
            if (page > billTable.gridObj.getTotalPages()) {
                alert('您所查找的页数不存在');
                return
            }
            if(page == ''){
                alert('页数不能为空');
                return
            }
            if(page <= 0 || isNaN(page)){
                alert('页数输入有误');
                return
            }
            billTable.gridObj.gotoPage(page);
        });

        //添加分页按钮
        var addHtml = '<td style="float: right;display: block"><div id="add"> '+'<div id="total">共<span id="totalPage"></span>页/<span id="totalData"></span>条记录' +
            '</div><div id="goPage">到第<input class="gotoThePage" type="text">页' +
            '<div id="goBtn">确定</div></div></div></td>';
        $('#' + billTable.gridObj.options.pagingOutTabId + ' tr:eq(0)').prepend(addHtml);

        //添加打印按钮
        var buttonHtml = '<td style="float: left;">' +
            '<div class="printBtn" onclick="billTable.doPrint()"><img src="img/print1.png"><div class="print">打印</div></div>' +
            '<div class="toExcelBtn" onclick="billTable.doToExcel()"><img src="img/toExcel.png"><div class="export">导出</div></div></td>';
        $('#' + billTable.gridObj.options.pagingOutTabId + ' tr:eq(0)').prepend(buttonHtml);

        $('#goBtn').click(function () {
            var page = $('#goPage input').val();
            billTable.gridObj.gotoPage(page);
        });

        // 打印、导出按钮的鼠标悬停样式变化
        /*$(".printBtn").on("mouseover", function () {
            Tools.buttonStyle('img/printed.png', this);
        })
        $(".printBtn").on("mouseout", function () {
            Tools.buttonStyle('img/print1.png', this);
        })
        $(".toExcelBtn").on("mouseover", function () {
            Tools.buttonStyle('img/toExceled.png', this);
        })
        $(".toExcelBtn").on("mouseout", function () {
            Tools.buttonStyle('img/toExcel.png', this);
        })*/
    },

    //打印
    doPrint: function () {
        $('#search').hide();
        $('#test_pt_outTab').hide();
        $(".navigation").hide();
        window.print();
        $('#search').show();
        $('#test_pt_outTab').show();
        $(".navigation").show();
    },
    //导出
    /*doToExcel: function () {
        var search = billTable.gridObj.getPageCondition(billTable.gridObj.getCurPage()) + '';
        var url = urlConfig.carIORecord.getIoReportExcelUrl + '?' + search + '&UID=' + carPark.UID;
        window.open(url, '_parent');
    },*/
    //表格render
    incountMoney:function (record) {
        return "<span class='tRight fRed'>" + tools.moneyFormat(record.tran_amount) + "</span>"
    },
    taxRate:function (record) {
        return "<span>" + record.fee_rate + "</span>"
    },
    comission:function (record) {
        return "<span class='tRight fRed'>" + tools.moneyFormat(record.fee_amount) + "</span>"
    },
    investMoney:function (record) {
        return "<span class='tRight fRed'>" + tools.moneyFormat(record.enter_account_amount) + "</span>"
    }
};
//小计
function incountMoney(gridObj, option) {
    let count = 0;
    for(let i = 0; i < option.curPageRowsNum; i++){
        count += parseFloat(gridObj.getColumnValue(i, 'tran_amount'));
    }
    return `<span class="fRed tRight">${tools.moneyFormat(count + '')}</span>`
}

function commission(gridObj, option) {
    let count = 0;
    for(let i = 0; i < option.curPageRowsNum; i++){
        count += parseFloat(gridObj.getColumnValue(i, 'fee_amount'));
    }
    return `<span class="fRed tRight">${tools.moneyFormat(count + '')}</span>`
}

function investMoney(gridObj, option) {
    let count = 0;
    for(let i = 0; i < option.curPageRowsNum; i++){
        count += parseFloat(gridObj.getColumnValue(i, 'enter_account_amount'));
    }
    return `<span class="fRed tRight">${tools.moneyFormat(count + '')}</span>`
}

var carParkRecordDetails={
    userList: [],
    carParkList: [],
    searchCriteria: {},
    userName: '',
    carPark: '',
    isShowForUserList: false,
    isShowForcarParkList: false,
    init: function () {
        //获取用户列表
        this.getUserList();
        this.getCarParkList();
        this.eventInit();
    },
    //获取用户列表
    getUserList:function () {
        $.ajax({
            url:urlConfig.tableSelectMsg.getUserListUrl,
            type: "post",
            data: "start_datetime=2018-01-01 00:00:00&end_datetime=2027-05-31 23:59:59&pageSize=10000&curPage=1&sortName=create_datetime&sortOrder=desc",
            dataType:"json",
            success:function (res) {
                carParkRecordDetails.userList = res.data;
                //默认第一个用户显示
                let searchObj = tools.searchStrToObj(location.href);
                console.log(searchObj)
                if(searchObj && searchObj.third_cust_id){
                    $('#choose_user').val(searchObj.third_cust_name);
                    $('#choose_user').attr('username', searchObj.third_cust_id);
                    $('#choose_park').val(searchObj.car_park_name);
                    $('#choose_park').attr('carpark', searchObj.car_park_id);
                    carParkRecordDetails.userName = searchObj.third_cust_name;
                    carParkRecordDetails.carPark = searchObj.car_park_name;
                }else{
                    $('#choose_user').val(carParkRecordDetails.userList[0].nick_name);
                    $('#choose_user').attr('username', carParkRecordDetails.userList[0].third_cust_id);
                    $('#choose_park').val('全部');
                    $('#choose_park').attr('carpark', '');
                    carParkRecordDetails.userName = carParkRecordDetails.userList[0].nick_name;
                    carParkRecordDetails.carPark = '全部';
                }
                carParkRecordDetails.searchCriteria = {
                    third_cust_id: $('#choose_user').attr('username'),
                    car_park_id: $('#choose_park').attr('carpark'),
                    pay_order_no: '',
                    start_datetime: $('.start_datetime_search').val(),
                    end_datetime: $('.end_datetime_search').val(),
                    sortName: 'create_datetime',
                    sortOrder: 'desc'
                };
                billTable.init();
            },
            error: function (err) {
                console.log(err)
            }
        })
    },
    //获取车场列表
    getCarParkList: function () {
        $.ajax({
            url: urlConfig.tableSelectMsg.getParkListUrl,
            type: "post",
            data:"start_datetime=2018-01-01 00:00:00&end_datetime=2027-05-31 23:59:59&pageSize=10000&curPage=1&sortName=create_datetime&sortOrder=desc",
            dataType: "json",
            success: function (res) {
                carParkRecordDetails.carParkList = res.data;
                carParkRecordDetails.carParkList.unshift({
                    car_park_name: '全部',
                    car_park_id: ''
                })
                //默认第一个车场显示
            },
            error: function (err) {
                console.log(err)
            }
        })
    },
    eventInit:function () {
        //选择会员
        //点击获取下拉框
        $('#choose_user').focus(function () {
            $('.user-list').css('display', 'block');
            $('.user_select .search_input_div .model').css('display', 'block');
            $('.park-list').css('display', 'none');
            $('.park_select .search_input_div .model').css('display', 'none');
            $(this).val('');
            tools.selectItemForArr($(this), carParkRecordDetails.userList, 'username', '.user-list ul', 'nick_name', 'third_cust_id');
            $(this).keyup(function () {
                tools.selectItemForArr($(this), carParkRecordDetails.userList, 'username', '.user-list ul', 'nick_name', 'third_cust_id')
            })
        }).blur(function () {
            if(!$(this).val()){
                $(this).val(carParkRecordDetails.userName)
            }
        });
        //点击模态框关闭下拉菜单
        $('.user_select .search_input_div .model').click(function () {
            $('.user-list').css('display', 'none');
            $(this).css('display', 'none')
        });
        //选中用户
        $('.user-list').on('click','li', function () {
            $('.user-list').css('display', 'none');
            $('.user_select .search_input_div .model').css('display', 'none');
            $('#choose_user').val($(this).html());
            $('#choose_user').attr('username', $(this).attr('username'));
            carParkRecordDetails.userName = $('#choose_user').val();
            carParkRecordDetails.searchCriteria = {
                third_cust_id: $('.user_name').attr('username'),
                car_park_id: $('.park_name').attr('carpark'),
                pay_order_no: $('.order_search').val(),
                start_datetime: $('.start_datetime_search').val(),
                end_datetime: $('.end_datetime_search').val(),
                sortName: 'create_datetime',
                sortOrder: 'desc'
            };
            if(!carParkRecordDetails.searchCriteria.start_datetime || !carParkRecordDetails.searchCriteria.end_datetime){
                alert('提现时间不能为空');
                return;
            }
            billTable.gridObj.search(carParkRecordDetails.searchCriteria)
        });
        //选择车场
        //点击获取下拉框
        $('#choose_park').focus(function () {
            $('.park-list').css('display', 'block');
            $('.park_select .search_input_div .model').css('display', 'block');
            $('.user-list').css('display', 'none');
            $('.user_select .search_input_div .model').css('display', 'none');
            $(this).val('');
            tools.selectItemForArr($(this), carParkRecordDetails.carParkList, 'carpark', '.park-list ul', 'car_park_name', 'car_park_id')
            $(this).keyup(function () {
                tools.selectItemForArr($(this), carParkRecordDetails.carParkList, 'carpark', '.park-list ul', 'car_park_name', 'car_park_id')
            })
        }).blur(function () {
            if(!$(this).val()){
                $(this).val(carParkRecordDetails.carPark)
            }
        });
        //点击模态框关闭下拉菜单
        $('.park_select .search_input_div .model').click(function () {
            $('.park-list').css('display', 'none');
            $(this).css('display', 'none')
        });
        //选中车场
        $('.park-list').on('click', 'li', function () {
            $('.park-list').css('display', 'none');
            $('.park_select .search_input_div .model').css('display', 'none');
            $('#choose_park').val($(this).html());
            $('#choose_park').attr('carpark', $(this).attr('carpark'));
            carParkRecordDetails.carPark = $('#choose_park').val();
            carParkRecordDetails.searchCriteria = {
                third_cust_id: $('.user_name').attr('username'),
                car_park_id: $('.park_name').attr('carpark'),
                pay_order_no: $('.order_search').val(),
                start_datetime: $('.start_datetime_search').val(),
                end_datetime: $('.end_datetime_search').val(),
                sortName: 'create_datetime',
                sortOrder: 'desc'
            };
            if(!carParkRecordDetails.searchCriteria.start_datetime || !carParkRecordDetails.searchCriteria.end_datetime){
                alert('提现时间不能为空');
                return;
            }
            billTable.gridObj.search(carParkRecordDetails.searchCriteria)
        });
        //去除空格
        $('.order_search').blur(function () {
            $('.order_search').val($('.order_search').val().replace(/\s+/g,""));
        })
        //点击查询
        $('.nav .searchInput').click(function () {
            carParkRecordDetails.searchCriteria = {
                third_cust_id: $('.user_name').attr('username'),
                car_park_id: $('.park_name').attr('carpark'),
                pay_order_no: $('.order_search').val().replace(/\s+/g,""),
                start_datetime: $('.start_datetime_search').val(),
                end_datetime: $('.end_datetime_search').val(),
                sortName: 'create_datetime',
                sortOrder: 'desc'
            }
            if(!carParkRecordDetails.searchCriteria.start_datetime || !carParkRecordDetails.searchCriteria.start_datetime){
                alert('提现时间不能为空');
                return;
            }
            billTable.gridObj.search(carParkRecordDetails.searchCriteria)
        })
    },
    //调用接口获取表格对象的各项金额总和
    getRecordTotal:function(data){
        $.ajax({
            url: urlConfig.carParkRecharge.reChargeTotal,
            type: 'post',
            dataType: "json",
            data: data,
            success: function (res) {
                if(res.code === '500'){
                    $('#totalTranCount').html('0');
                    $('#totalAmount').html('0');
                    $('#totalTranAmount').html('0');
                    $('#totalFeeAmount').html('0');
                    return;
                }
                $('#totalTranCount').html(res.data.tran_count);
                $('#totalFeeAmount').html(tools.moneyFormat(res.data.total_fee_amount));
                $('#totalAmount').html(tools.moneyFormat(res.data.total_tran_amount));
                $('#totalTranAmount').html(tools.moneyFormat(res.data.total_amount))
            },
            error: function(msg){
                console.log(msg)
            }
        })
    },
};
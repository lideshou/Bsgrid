var tools = {
    buttonStyle: function (imgSrc, dom) {
        var imgSrc = imgSrc;

        $(dom).children("img").attr("src", imgSrc);
    },
    //时间个位数转换
    doubleDate: function (date) {
        if (date < 10) {
            return '0' + date
        } else {
            return date
        }
    },
    //查询字符串转化为对象
    searchStrToObj: function (str){
        str = decodeURIComponent(str)
        let searchStr = str.split('?')[1];
        if(!searchStr) return;
        let searchArr = searchStr.split('&');
        let searchObj = {}
        searchArr.map((item, index)=>{
            let itemArr = item.split('=');
            searchObj[itemArr[0]] = itemArr[1]
        })
        return searchObj;
    },
    //下拉菜单内容
    selectItemForArr: function (dom, arr, prop, showDom, search1, search2) {
        let showArr = [];
        for (let i = 0; i < arr.length; i++) {
            if (arr[i][search1].indexOf(dom.val()) >= 0) {
                showArr.push(arr[i])
            }
        }
        let msg = '';
        for (let j = 0; j < showArr.length; j++) {
            msg += `<li title=${showArr[j][search1]} ${prop}=${showArr[j][search2]}>${showArr[j][search1]}</li>`;
        }
        $(showDom).html(msg);
    },
    //格式化时间 年-月-日 时:分:秒
    formatDate: function (time) {
        let year = time.getFullYear();
        let month = tools.doubleDate(parseInt(time.getMonth()) + 1);
        let date = tools.doubleDate(time.getDate());
        let hour = tools.doubleDate(time.getHours());
        let minute = tools.doubleDate(time.getMinutes());
        let second = tools.doubleDate(time.getSeconds());
        return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
    },
    //设置默认时间
    setDefaultDate: function () {
        let searchObj = tools.searchStrToObj(location.href);
        if(searchObj && searchObj.end_datetime && searchObj.start_datetime){
            $('.end_datetime_search').val(searchObj.end_datetime.replace('%20', ' '));
            $('.start_datetime_search').val(searchObj.start_datetime.replace('%20', ' '))
            return
        }
        let localDate = new Date();
        let localYear = localDate.getFullYear();
        let localMonth = localDate.getMonth();
        let localDay = localDate.getDate();
        let newEndDate = new Date(localYear, localMonth, localDay, 23, 59, 59);
        let newStartDate = new Date(localYear, localMonth, localDay - 7, 0, 0, 0);
        $('.end_datetime_search').val(tools.formatDate(newEndDate));
        $('.start_datetime_search').val(tools.formatDate(newStartDate));
    },
    //获取字符数，汉字占两个字符
    //参数说明：val-检查字符
    getByteLen:function (val) {
        let len = 0;
        for (let i = 0; i < val.length; i++) {
            let a = val.charAt(i);
            if (a.match(/[^\x00-\xff]/ig) != null) {
                len += 2;
            }
            else {
                len += 1;
            }
        }
        return len;
    },
    //金额格式化 1000,1000,1000.11
    //参数说明：money-金额
    moneyFormat: function (money) {
        money = money + '';
        let decimal = money.split('.')[1];
        let integer = money.split('.')[0];
        let numArr = integer.split('');
        numArr.reverse();
        for (let i = 0; i < numArr.length; i++) {
            if ((i + 1) % 4 === 0) {
                numArr.splice(i, 0, ',')
            }
        }
        numArr.reverse();
        decimal = decimal ? '.' + decimal : '.00'
        decimal = parseFloat(decimal).toFixed(2)
        let result = numArr.join('') + '.' + (decimal + '').split('.')[1]
        return result;
    },
    //检查手机/座机号格式
    //参数说明：tel-手机/座机号
    //返回说明：true-通过验证 false-验证失败
    checkTel:function(tel)
    {
        var mobile = /^1[3|5|8]\d{9}$/ , phone = /^0\d{2,3}-?\d{7,8}$/;
        return mobile.test(tel) || phone.test(tel);
    },
}
$(function () {
    template.defaults.imports.dataFormat = function (dtStr) {
        var dt = new Date(dtStr)

        var y = dt.getFullYear()
        var m = padZero(dt.getMonth() + 1)
        var d = padZero(dt.getDate())

        var hh = padZero(dt.getHours())
        var mm = padZero(dt.getMinutes())
        var ss = padZero(dt.getSeconds())

        return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ":" + ss
    }

    function padZero(n) {
        return n > 9 ? n : '0' + n;
    }
    var q = {
        pagenum: 1,     //页码值
        pagesize: 2,    //每页显示多少条数据
        cate_id: "",    //文章分类的 Id
        state: "",      //文章的状态，可选值有：已发布、草稿
    };
    // 2.初始化文章列表
    var layer = layui.layer;
    initTable();
    function initTable() {
        $.ajax({
            method: "GET",
            url: '/my/article/list',
            data: q,
            success: function (res) {
                //预判ajax获取文章列表数据
                if (res.status !== 0) {
                    return layer.msg("获取文章列表失败！")
                }
                var htmlStr = template("tpl-table", res);
                $("tbody").html(htmlStr);
                renderPage(res.total);
            }
        })
    }
    //3.初始化分类
    var form = layui.form;
    initCate();
    function initCate() {
        $.ajax({
            method: "GET",
            url: '/my/article/cates',
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg(res.message);
                }
                var htmlStr = template("tpl-cate", res);
                $("[name=cate_id]").html(htmlStr);
                form.render();
            }
        })
    }
    //4.筛选功能
    $("#form-search").on("submit", function (e) {
        e.preventDefault();
        var state = $("[name=state]").val();
        var cate_id = $("[name=cate_id]").val();
        q.state = state;
        q.cate_id = cate_id;
        initTable();
    })
    //5.分页
    var laypage = layui.laypage;
    function renderPage(total) {
        // alert(tatal);
        laypage.render({
            elem: "pageBox",
            count: total,	//数据总数。一般通过服务端得到	Number	-
            limit: q.pagesize,
            curr: q.pagenum,

            layout: ['count', 'limit', 'prev', 'page', 'next', 'skip'],
            limits: [2, 3, 5, 10],

            //触发jump：分页初始化的时候，页码改变的时候
            jump: function (obj, first) {
                q.pagenum = obj.curr;
                q.pagesize = obj.limit;
                if (!first) {
                    initTable();
                }
            }
        })
    }
    // 6.删除
    var layer = layui.layer;
    $('tbody').on('click', '.btn-delete', function () {
        var Id = $(this).attr("data-id");
        layer.confirm('是否确认删除?', { icon: 3, title: '提示' }, function (index) {
            $.ajax({
                method: "GET",
                url: '/my/article/delete/' + Id,
                success: function (res) {
                    if (res.status !== 0) {
                        return layer.msg(res.message)
                    }

                    layer.msg("恭喜您，文章删除成功！")
                    if ($(".btn-delete").length == 1 && q.pagenum > 1) q.pagenum--;
                    initTable();
                }
            })
            layer.close(index);
        })
    })
})
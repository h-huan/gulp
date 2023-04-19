<!--
 * @Author: h-huan
 * @Date: 2023-03-23 11:40:08
 * @LastEditors: h-huan
 * @LastEditTime: 2023-03-24 09:40:37
 * @Description: 
-->

## gulp流程管理

- 开发环境
  - gulp default		开发环境（默认任务）
  - gulp html		HTML处理
  - gulp sass		样式处理
  - gulp script		JS文件压缩&重命名
  - gulp images		图片压缩
  - gulp concat		文件合并
  - gulp release		打包发布

- 发布环境
  - gulp release		打包发布
  - gulp clean		清理文件
  - gulp sassRelease		样式处理
  - gulp scriptRelease	脚本压缩&重命名

## fileinclude 包含语法 

官网： https://github.com/haoxins/gulp-file-include

1. 导航条
``` html
<!-- index.html -->
<!DOCTYPE html>
<html>
  <body>
   @@include('./navbar.html',{
     "index": "active"
   })
  </body>
</html>
```

``` html
<!-- navbar.html -->
<ul class="navbar">
    <li @@if (context.index==='active' ) { class="active" }>
        <a href="index.html">首页</a>
    </li>
    <li @@if (context.about==='active' ) { class="active" }>
        <a href="about.html">关于</a>
    </li>
    <li @@if (context.contact==='active' ) { class="active" }>
        <a href="contact.html">联系我们</a>
    </li>
</ul>
```

2. 面包屑
``` html
<!-- index.html -->
<!DOCTYPE html>
<html>
  <body>
    @@include('./breadcrumb.html',{
        "title":"首页",
        "breadcrumb":[{
            "url":"...",
            "text":"首页"
        },{
            "url":"...",
            "text":"链接一"
        },{
            "url":"",
            "text":"链接二"
        }]
    })
  </body>
</html>
```

``` html
<!-- breadcrumb.html -->
<div class="page-header">
    <h2>@@title</h2>
    <ol class="breadcrumb">
    @@for (var i = 0; i < (context.breadcrumb.length-1); i++) {
        <li><a href="`+context.breadcrumb[i].url+`">`+context.breadcrumb[i].text+`</a></li>
    }
    <!-- 面包屑最后一项无链接 -->
    @@for (var i = (context.breadcrumb.length-1); i < context.breadcrumb.length; i++) {
        <li><strong>`+context.breadcrumb[i].text+`</strong></li> 
    }
    </ol>
</div>
```

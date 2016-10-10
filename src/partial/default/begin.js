
;( function (
    global, 

    top,
    parent,
    window, 
    document,
    location,
    navigator,
    localStorage,
    sessionStorage,
    console,
    history,
    setTimeout,
    setInterval,

    JSON,

    Array, 
    Boolean,
    Date,
    Error,
    Function,
    Math,
    Number,
    Object,
    RegExp,
    String,
    
    //强制为 undefined，避免模块内因为没有显式地使用 require('$') 来加载而意外使用到外部的 $。
    //这样更容易发现错误，即发现模块内没有显式使用 var $ = require('$'); 的情况。
    $, 

    undefined
) {


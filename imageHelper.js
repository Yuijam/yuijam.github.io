"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toLocalContent = exports.toBlogContent = exports.readAllPosts = exports.POSTS_PATH = void 0;
var fs = __importStar(require("fs"));
var path_1 = __importDefault(require("path"));
var BLOG_ROOT_PATH = '.';
exports.POSTS_PATH = path_1.default.join(BLOG_ROOT_PATH, '_posts');
var isNetPath = function (imgPath) { return imgPath.slice(0, 4) === 'http'; };
var isBlogPath = function (imgPath) { return imgPath.startsWith('/images') || imgPath.startsWith('\\images'); };
var isLocalPath = function (imgPath) { return !isNetPath(imgPath) && !isBlogPath(imgPath); };
var flatten = function (arr) {
    var newArr = [].concat.apply([], arr);
    return newArr.some(Array.isArray) ? flatten(newArr) : newArr;
};
exports.readAllPosts = function () {
    return fs.readdirSync(exports.POSTS_PATH).map(function (name) { return ({
        content: fs.readFileSync(path_1.default.join(exports.POSTS_PATH, name), 'utf8'),
        postName: name,
    }); });
};
var getAllImagePaths = function (str) {
    var imageTagsReg = /\!\[.*?\].*?(png|jpg)\)/gi;
    var imageTags = str.match(imageTagsReg);
    if (!imageTags) {
        return [];
    }
    var pathReg = /\(.+\)/g;
    var pathsWithParentheses = flatten(imageTags.map(function (item) { return item.match(pathReg); }));
    var paths = pathsWithParentheses.map(function (item) { return item.slice(1, -1); });
    return paths;
};
var getPostImgDirPath = function (postName) { return path_1.default.join(__dirname, 'images', postName); };
var isPostImgDirExist = function (postName) { return fs.existsSync(getPostImgDirPath(postName)); };
var toPostImgPath = function (originPath, postName) {
    var filename = path_1.default.basename(originPath);
    return path_1.default.join(getPostImgDirPath(postName), filename);
};
var toPostImgBlogPath = function (imgPath, postName) {
    var res = toPostImgPath(imgPath, postName).match(/.images.*/g);
    if (!res) {
        console.log(imgPath + ", " + postName + ": image blog path convert failed");
        return '';
    }
    return res[0];
};
var moveFileToPostImgDir = function (imgPath, postName) {
    if (!fs.existsSync(imgPath)) {
        throw imgPath + " is not exist!";
    }
    if (!isPostImgDirExist(postName)) {
        fs.mkdirSync(getPostImgDirPath(postName));
    }
    fs.copyFileSync(imgPath, toPostImgPath(imgPath, postName));
};
var toBlogPath = function (imgPath, postName) {
    if (!isLocalPath(imgPath)) {
        return imgPath;
    }
    moveFileToPostImgDir(imgPath, postName);
    return toPostImgBlogPath(imgPath, postName);
};
var toLocalPath = function (imgPath) {
    if (isLocalPath(imgPath) || isNetPath(imgPath)) {
        return imgPath;
    }
    return path_1.default.join(__dirname, imgPath);
};
var getPostTitle = function (content) {
    var headerTag = '---';
    var start = content.indexOf(headerTag);
    var end = content.indexOf(headerTag, start + headerTag.length);
    var header = content.substring(start + headerTag.length, end);
    var titleTag = header.split('\n').find(function (str) { return str.includes('title'); });
    if (!titleTag) {
        throw "title not found!" + content.substring(0, 30);
    }
    return titleTag.split(':')[1].trim();
};
exports.toBlogContent = function (content) {
    var allImagePaths = getAllImagePaths(content);
    return allImagePaths.reduce(function (acc, cur) {
        var postName = getPostTitle(content);
        var blogPath = toBlogPath(cur, postName);
        return acc.replace(cur, blogPath);
    }, content);
};
exports.toLocalContent = function (content) {
    var allImagePaths = getAllImagePaths(content);
    return allImagePaths.reduce(function (acc, cur) {
        var localPath = toLocalPath(cur);
        return localPath === cur ? acc : acc.replace(cur, localPath);
    }, content);
};

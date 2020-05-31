echo "input title:"
read title
title=${title}
echo "input tags:"
read tags
# first param is time
if [ $1 ]
then
    time=$1
else
    time=$(date "+%Y-%m-%d")
fi
filename=${time}-${title}.md
new_post=_posts/$filename
cp _sample_post $new_post
sed -i "s/_title/${title}/g" $new_post

echo $tags
tag_str=''
if [ ${#tags} -gt 0 ]
then
    for tag in ${tags}
    do
        tag_str=$tag_str$tag", "
    done
    len=${#tag_str}-2
    tag_str=${tag_str}
fi
sed -i "s/_tags/${tag_str}/g" $new_post
echo "done!"
echo "opening～～～～"
typora ${new_post}

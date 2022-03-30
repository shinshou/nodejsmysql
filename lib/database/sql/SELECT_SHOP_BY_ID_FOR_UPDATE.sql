SELECT 
* 
FROM
t_shop
WHERE
id=?
FOR UPDATE -- 更新行のみのロック
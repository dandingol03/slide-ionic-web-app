/**
 * Created by danding on 16/12/26.
 */

//first type assertion
let some:any='this is a string';
let len:number=(<string>some).length;

//second type assertion
let somtT:any='this is a other string';
let lenT:number=(somtT as string).length;


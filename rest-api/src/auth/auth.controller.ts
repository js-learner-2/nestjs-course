import {Body, Controller, Post, UnauthorizedException} from '@nestjs/common';
import { Model } from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import * as password from 'password-hash-and-salt';
import * as jwt from 'jsonwebtoken';
import {JWT_SECRET} from '../constants';
import {User} from '../../../shared/user';
import { AuthRepository } from './auth.repository';
import { resolve } from 'dns';


@Controller("auth")
export class AuthController {

    constructor(
        @InjectModel("User") private userModel: Model,
        private authDB: AuthRepository) {

    }

    @Post("register")
    async register(
        @Body("email") email: string,
        @Body("password") pwd: string
    ) {
        console.log("creating new user");

        return new Promise((resolve, reject) => {
            password(pwd).hash((error, hash) => {
                if (error) {
                    throw new Error('Cannot hash!');
                }
            
                // Store the hash in your database
                console.log('Hashed Password:', hash);

                const user: User = {
                    email: email,
                    roles: ["ADMIN", "USER"],
                    passwordHash: hash
                };
                
                this.authDB.addUser(user)

                const authJwtToken =
                        jwt.sign({email, roles: user.roles},
                            JWT_SECRET);

                resolve({authJwtToken});
            });
        })
    }

    @Post("login")
    async login(@Body("email") email:string,
        @Body("password") plaintextPassword:string) {

        const user = await this.userModel.findOne({email});

        if(!user) {
            console.log("User does exist on the database.");
            throw new UnauthorizedException();
        }

        return new Promise((resolve, reject) => {
            password(plaintextPassword).verifyAgainst(
                user.passwordHash,
                (err, verified) => {
                    if (!verified) {
                        reject(new UnauthorizedException());
                    }

                    const authJwtToken =
                        jwt.sign({email, roles: user.roles},
                            JWT_SECRET);

                    resolve({authJwtToken});
                }
            );
        });
    }

}














import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, ReplaySubject, share } from "rxjs";
import { Page } from "src/app/models/page.model";
import { AdminEditableUser, DirectLogInUser, DirectSignInUser, User, UserEvent } from "src/app/models/user.model";
import { environment } from "src/environments/environment";
import { AuthenticationResponse } from "../../api/response.models";
import { SessionService } from "./session.service";

export type UserEventType = "promote" | "disable" | "enable";

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private serviceEndpoint = `${environment.apiUrl}/User`;

    constructor(private http: HttpClient, private sessionService: SessionService) { }

    signIn(userObject: DirectSignInUser) : Observable<any> {
        return this.beginUserTracking(this.http.post(this.serviceEndpoint, userObject));
    }

    logIn(userObject: DirectLogInUser) {
        return this.beginUserTracking(this.http.post(`${this.serviceEndpoint}/authenticate`, userObject));
    }

    private beginUserTracking(req : Observable<any>) : Observable<any> {
        req = req.pipe(
            share({connector: () => new ReplaySubject(1)})
        );
        req.subscribe((token: AuthenticationResponse) => this.sessionService.saveUser(token));
        return req;
    }

    getProfileInformation() : Observable<User> {
        return <any>this.http.get(this.serviceEndpoint);
    }

    updateProfileInformation(userInfo: User) : Observable<any> {
        return <any>this.http.put(this.serviceEndpoint, userInfo);
    }

    getUsers(pageNumber : number, pageSize: number, query : string) : Observable<Page<AdminEditableUser>> {
        console.log('getUsers');
        return <any>this.http.get(`${this.serviceEndpoint}/admin?page=${pageNumber}&pageSize=${pageSize}&q=${query}`);
    }

    editUser(event: UserEvent) : Observable<AdminEditableUser> {
        return <any>this.http.put(`${this.serviceEndpoint}/admin`, event);
    }
}
// Copyright 2023 Datav.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
package models

import (
	"context"
	"database/sql"
	"time"

	"github.com/DataObserve/datav/query/pkg/db"
)

// ! You should not modify the two constants below
const (
	SuperAdminUsername = "admin"
	SuperAdminId       = 1
)

func IsSuperAdmin(id int64) bool {
	return id == SuperAdminId
}

type Session struct {
	Token      string `json:"token"`
	User       *User  `json:"user"`
	CreateTime time.Time
}

type User struct {
	Id         int64      `json:"id"`
	Username   string     `json:"username"`
	Name       string     `json:"name"`
	Email      *string    `json:"email"`
	Mobile     string     `json:"mobile"`
	Role       RoleType   `json:"role"`
	LastSeenAt *time.Time `json:"lastSeenAt,omitempty"`
	Created    time.Time  `json:"created,omitempty"`
	Updated    time.Time  `json:"updated,omitempty"`
	SideMenu   int64      `json:"sidemenu,omitempty"`
	Visits     int        `json:"visits,omitempty"`
	Salt       string     `json:"-"`
	Password   string     `json:"-"`
}

type Users []*User

func (s Users) Len() int      { return len(s) }
func (s Users) Swap(i, j int) { s[i], s[j] = s[j], s[i] }
func (s Users) Less(i, j int) bool {
	return s[i].Created.Unix() > s[j].Created.Unix()
}

// func QueryUser(id int64, username string, email string) (*User, error) {
// 	user := &User{}
// 	err := db.Conn.QueryRow(`SELECT id,username,name,email,mobile,password,salt,last_seen_at FROM user WHERE id=? or username=? or email=?`,
// 		id, username, email).Scan(&user.Id, &user.Username, &user.Name, &user.Email, &user.Mobile, &user.Password, &user.Salt, &user.LastSeenAt)
// 	if err != nil && err != sql.ErrNoRows {
// 		return user, err
// 	}

// 	if user.Id == 0 {
// 		return user, nil
// 	}

// 	globalMember, err := QueryTeamMember(GlobalTeamId, user.Id)
// 	if err != nil {
// 		return user, err
// 	}

// 	user.Role = globalMember.Role

// 	return user, nil
// }

func QueryUserById(ctx context.Context, id int64) (*User, error) {
	user := &User{}
	err := db.Conn.QueryRowContext(ctx, `SELECT id,username,name,email,mobile,password,salt,sidemenu,last_seen_at,created FROM user WHERE id=?`,
		id).Scan(&user.Id, &user.Username, &user.Name, &user.Email, &user.Mobile, &user.Password, &user.Salt, &user.SideMenu, &user.LastSeenAt, &user.Created)
	if err != nil && err != sql.ErrNoRows {
		return user, err
	}

	if user.Id == 0 {
		return user, nil
	}

	globalMember, err := QueryTeamMember(ctx, GlobalTeamId, user.Id)
	if err != nil {
		return user, err
	}

	user.Role = globalMember.Role

	return user, nil
}

func QueryUserByName(ctx context.Context, username string) (*User, error) {
	user := &User{}
	err := db.Conn.QueryRowContext(ctx, `SELECT id,username,name,email,mobile,password,salt,sidemenu,last_seen_at FROM user WHERE username=?`,
		username).Scan(&user.Id, &user.Username, &user.Name, &user.Email, &user.Mobile, &user.Password, &user.Salt, &user.SideMenu, &user.LastSeenAt)
	if err != nil && err != sql.ErrNoRows {
		return user, err
	}

	if user.Id == 0 {
		return user, nil
	}

	return user, nil
}

type GithubUser struct {
	ID       int64  `json:"id"`
	Avatar   string `json:"avatar_url"`
	Username string `json:"login"`
	Name     string `json:"name"`
	Tagline  string `json:"bio"`
	Website  string `json:"blog"`
	Location string `json:"location"`
}

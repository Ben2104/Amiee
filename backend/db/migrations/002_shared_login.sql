-- Username sign-in with one shared login for the two of us.
-- A member row may now be a shared account (display_name NULL): whoever signs in
-- picks Ben or Amie, and each item stores that name as its author.

alter table members drop constraint if exists members_display_name_key;
alter table members drop constraint if exists members_display_name_check;
alter table members alter column display_name drop not null;
alter table members add constraint members_display_name_check check (display_name is null or display_name in ('Ben', 'Amie'));

alter table letters add column if not exists author text;
alter table milestones add column if not exists author text;
alter table love_notes add column if not exists author text;
alter table events add column if not exists author text;

update letters t set author = m.display_name from members m where m.user_id = t.author_id and t.author is null;
update milestones t set author = m.display_name from members m where m.user_id = t.author_id and t.author is null;
update love_notes t set author = m.display_name from members m where m.user_id = t.author_id and t.author is null;
update events t set author = m.display_name from members m where m.user_id = t.author_id and t.author is null;

alter table letters alter column author set not null;
alter table milestones alter column author set not null;
alter table love_notes alter column author set not null;
alter table events alter column author set not null;

alter table letters add constraint letters_author_check check (author in ('Ben', 'Amie'));
alter table milestones add constraint milestones_author_check check (author in ('Ben', 'Amie'));
alter table love_notes add constraint love_notes_author_check check (author in ('Ben', 'Amie'));
alter table events add constraint events_author_check check (author in ('Ben', 'Amie'));
